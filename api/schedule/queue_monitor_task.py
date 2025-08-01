import logging
from datetime import datetime

import click
from kombu.utils.url import parse_url  # type: ignore
from redis import Redis

import app
from configs import dify_config
from extensions.ext_database import db
from libs.email_i18n import EmailType, get_email_i18n_service

redis_config = parse_url(dify_config.CELERY_BROKER_URL)
celery_redis = Redis(
    host=redis_config.get("hostname") or "localhost",
    port=redis_config.get("port") or 6379,
    password=redis_config.get("password") or None,
    db=int(redis_config.get("virtual_host")) if redis_config.get("virtual_host") else 1,
)


@app.celery.task(queue="monitor")
def queue_monitor_task():
    queue_name = "dataset"
    threshold = dify_config.QUEUE_MONITOR_THRESHOLD

    try:
        queue_length = celery_redis.llen(f"{queue_name}")
        logging.info(click.style(f"Start monitor {queue_name}", fg="green"))
        logging.info(click.style(f"Queue length: {queue_length}", fg="green"))

        if queue_length >= threshold:
            warning_msg = f"Queue {queue_name} task count exceeded the limit.: {queue_length}/{threshold}"
            logging.warning(click.style(warning_msg, fg="red"))
            alter_emails = dify_config.QUEUE_MONITOR_ALERT_EMAILS
            if alter_emails:
                to_list = alter_emails.split(",")
                email_service = get_email_i18n_service()
                for to in to_list:
                    try:
                        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        email_service.send_email(
                            email_type=EmailType.QUEUE_MONITOR_ALERT,
                            language_code="en-US",
                            to=to,
                            template_context={
                                "queue_name": queue_name,
                                "queue_length": queue_length,
                                "threshold": threshold,
                                "alert_time": current_time,
                            },
                        )
                    except Exception as e:
                        logging.exception(click.style("Exception occurred during sending email", fg="red"))

    except Exception as e:
        logging.exception(click.style("Exception occurred during queue monitoring", fg="red"))
    finally:
        if db.session.is_active:
            db.session.close()

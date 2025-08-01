import { useContext } from 'react'
import type {
  StateCreator,
} from 'zustand'
import {
  useStore as useZustandStore,
} from 'zustand'
import { createStore } from 'zustand/vanilla'
import type { ChatVariableSliceShape } from './chat-variable-slice'
import { createChatVariableSlice } from './chat-variable-slice'
import type { EnvVariableSliceShape } from './env-variable-slice'
import { createEnvVariableSlice } from './env-variable-slice'
import type { FormSliceShape } from './form-slice'
import { createFormSlice } from './form-slice'
import type { HelpLineSliceShape } from './help-line-slice'
import { createHelpLineSlice } from './help-line-slice'
import type { HistorySliceShape } from './history-slice'
import { createHistorySlice } from './history-slice'
import type { NodeSliceShape } from './node-slice'
import { createNodeSlice } from './node-slice'
import type { PanelSliceShape } from './panel-slice'
import { createPanelSlice } from './panel-slice'
import type { ToolSliceShape } from './tool-slice'
import { createToolSlice } from './tool-slice'
import type { VersionSliceShape } from './version-slice'
import { createVersionSlice } from './version-slice'
import type { WorkflowDraftSliceShape } from './workflow-draft-slice'
import { createWorkflowDraftSlice } from './workflow-draft-slice'
import type { WorkflowSliceShape } from './workflow-slice'
import { createWorkflowSlice } from './workflow-slice'
import type { InspectVarsSliceShape } from './debug/inspect-vars-slice'
import { createInspectVarsSlice } from './debug/inspect-vars-slice'

import { WorkflowContext } from '@/app/components/workflow/context'
import type { LayoutSliceShape } from './layout-slice'
import { createLayoutSlice } from './layout-slice'
import type { WorkflowSliceShape as WorkflowAppSliceShape } from '@/app/components/workflow-app/store/workflow/workflow-slice'

export type Shape
  = ChatVariableSliceShape
  & EnvVariableSliceShape
  & FormSliceShape
  & HelpLineSliceShape
  & HistorySliceShape
  & NodeSliceShape
  & PanelSliceShape
  & ToolSliceShape
  & VersionSliceShape
  & WorkflowDraftSliceShape
  & WorkflowSliceShape
  & InspectVarsSliceShape
  & LayoutSliceShape
  & WorkflowAppSliceShape

type CreateWorkflowStoreParams = {
  injectWorkflowStoreSliceFn?: StateCreator<WorkflowAppSliceShape>
}

export const createWorkflowStore = (params: CreateWorkflowStoreParams) => {
  const { injectWorkflowStoreSliceFn } = params || {}

  return createStore<Shape>((...args) => ({
    ...createChatVariableSlice(...args),
    ...createEnvVariableSlice(...args),
    ...createFormSlice(...args),
    ...createHelpLineSlice(...args),
    ...createHistorySlice(...args),
    ...createNodeSlice(...args),
    ...createPanelSlice(...args),
    ...createToolSlice(...args),
    ...createVersionSlice(...args),
    ...createWorkflowDraftSlice(...args),
    ...createWorkflowSlice(...args),
    ...createInspectVarsSlice(...args),
    ...createLayoutSlice(...args),
    ...(injectWorkflowStoreSliceFn?.(...args) || {} as WorkflowAppSliceShape),
  }))
}

export function useStore<T>(selector: (state: Shape) => T): T {
  const store = useContext(WorkflowContext)
  if (!store)
    throw new Error('Missing WorkflowContext.Provider in the tree')

  return useZustandStore(store, selector)
}

export const useWorkflowStore = () => {
  return useContext(WorkflowContext)!
}

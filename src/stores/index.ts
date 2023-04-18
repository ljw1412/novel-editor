import { useCacheStore } from './cache'
import { useConfigStore } from './config'
import { useContextViewStore } from './context-view'
import { useDialogStore } from './dialog'
import { useEditorStore } from './editor'
import { useProjectStore } from './project'
import { useWinStore } from './win'

export { useConfigStore } from './config'
export { useContextViewStore } from './context-view'
export { useDialogStore } from './dialog'
export { useProjectStore } from './project'
export { useEditorStore } from './editor'
export { useWinStore } from './win'
export { useCacheStore } from './cache'

export default function () {
  const configStore = useConfigStore()
  const contextViewStore = useContextViewStore()
  const dialogStore = useDialogStore()
  const projectStore = useProjectStore()
  const editorStore = useEditorStore()
  const winStore = useWinStore()
  const cacheStore = useCacheStore()

  return {
    configStore,
    contextViewStore,
    dialogStore,
    projectStore,
    editorStore,
    winStore,
    cacheStore
  }
}

type IpcListener = (
  event: Electron.IpcRendererEvent,
  action: string,
  data?: Record<string, any>
) => void

/// <reference types="electron" />

type IpcListener = (
  event: Electron.IpcRendererEvent,
  action: string,
  data?: Record<string, any>
) => void

declare interface Window {
  readonly bridge: Readonly<{
    electron: Readonly<{
      ipcRenderer: Readonly<Electron.IpcRenderer>
    }>
    package: Readonly<{ version: string }>
    versions: Readonly<NodeJS.ProcessVersions>
  }>
}

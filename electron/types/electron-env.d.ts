/// <reference types="vite-plugin-electron/electron-env" />
/// <reference types="vite/types/ImportMeta"/>

declare namespace NodeJS {
  interface ProcessEnv {
    VSCODE_DEBUG?: 'true'
    DIST_ELECTRON: string
    DIST: string
    /** /dist/ or /public/ */
    PUBLIC: string
  }
}

type IpcListener = (
  event: Electron.IpcMainEvent,
  action: string,
  data?: Record<string, any>
) => any

type IpcAction = (
  event: Electron.IpcMainEvent,
  win: Electron.BrowserWindow | null,
  data?: Record<string, any>
) => any

type IpcInvokeListener = (
  event: Electron.IpcMainInvokeEvent,
  action: string,
  data?: Record<string, any>
) => any

type IpcInvokeAction = (
  event: Electron.IpcMainInvokeEvent,
  win: Electron.BrowserWindow | null,
  data?: Record<string, any>
) => any

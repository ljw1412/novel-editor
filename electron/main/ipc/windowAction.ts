import { ipcMain, BrowserWindow } from 'electron'
import type { WebContents } from 'electron'
import { createHandle, createListener } from '../services/ipc'

const channel = 'window'

const listener = createListener(channel, {})

const handle: IpcInvokeListener = createHandle(channel, {
  minimize: (e, win, data) => {
    if (!win) return false
    win.minimize()
  },
  toggleMaximize: (e, win) => {
    if (!win) return false
    if (win.isMaximized()) {
      win.unmaximize()
      return false
    } else {
      win.maximize()
      return true
    }
  },
  hide: (e, win) => {},
  close: (e, win) => {
    const allWindows = BrowserWindow.getAllWindows()
    allWindows.reverse().forEach((win) => {
      win.close()
    })
  }
})

function bind() {
  ipcMain.on(channel, listener)
  ipcMain.handle(channel, handle)
}

function unbind() {
  ipcMain.off(channel, listener)
  ipcMain.removeHandler(channel)
  console.log(`【${channel}】结束监听`)
}

export default { bind, unbind }

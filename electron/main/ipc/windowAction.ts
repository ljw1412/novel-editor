import { ipcMain, BrowserWindow } from 'electron'
import type { WebContents } from 'electron'

const channel = 'window'

function getSenderOwner(sender: WebContents): BrowserWindow {
  // @ts-ignore
  return sender.getOwnerBrowserWindow ? sender.getOwnerBrowserWindow() : null
}

const actions: Record<string, IpcAction> = {}
const listener: IpcListener = (e, action, data = {}) => {
  const win = getSenderOwner(e.sender)
  console.log(action, data)
  const actionFn = actions[action]
  if (!actionFn) {
    console.log(`【${channel}】 [E] 未找到action=${action}的监听处理`)
    return
  }
  actionFn(e, win, data)
}

const handleAction: Record<string, IpcInvokeAction> = {
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
}
const handle: IpcInvokeListener = (e, action, data) => {
  const win = getSenderOwner(e.sender)
  console.log(action, data)
  const actionFn = handleAction[action]
  if (!actionFn) {
    console.log(`【${channel}】 [E] 未找到action=${action}的监听处理`)
    return
  }
  actionFn(e, win, data)
}

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

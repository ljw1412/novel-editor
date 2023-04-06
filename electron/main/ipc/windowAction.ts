import { ipcMain, BrowserWindow } from 'electron'
import { createHandle, createListener } from '../services/ipc'
import * as winService from '../services/window'

const channel = 'window'

const listener = createListener(channel, {
  openPresetWindow(e, win, data) {
    const { name = '' } = data
    if (!winService.presetWindowNames.includes(name)) {
      console.error(`[预制窗体${name}]不在预制窗体列表中！`)
      return
    }
    let presetWin = winService.showWindowByName(name)
    if (!presetWin) {
      console.error(`[预制窗体${name}]显示失败，尝试创建！`)
      presetWin = winService.createPresetWindow(name)
      if (!presetWin) {
        console.error(`[预制窗体${name}]创建失败，请检查！`)
      }
    }
  }
})

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
  close: (e, win, data) => {
    const { who } = data
    if (who === 'main') {
      const allWindows = BrowserWindow.getAllWindows()
      allWindows.reverse().forEach((win) => {
        win.close()
      })
      return
    }
    if (win.isPreset) {
      return win.hide()
    }
    win.close()
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

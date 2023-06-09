import { ipcMain, BrowserWindow } from 'electron'
import { createHandle, createListener } from '../services/ipc'
import * as winService from '../services/window'

const channel = 'window'

const listener = createListener(channel, {
  openBuiltInBrowser(e, win, payload) {
    const { config = {}, options = {} } = payload
    new winService.BuiltInBrowser(config, options)
  },

  openSystemBrowser(e, win, payload) {
    const { config = {}, options = {} } = payload
    if (config.url) winService.openExternal(config.url)
  },

  openPresetWindow(e, win, payload) {
    const { name = '' } = payload
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
      } else {
        presetWin.once('ready-to-show', () => {
          presetWin.show()
        })
      }
    }
  }
})

const handle: IpcInvokeListener = createHandle(channel, {
  minimize: (e, win, payload) => {
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
  close: (e, win, payload) => {
    if (win.isPreset) {
      return win.hide()
    }
    win.close()
  },
  toggleDevTools: (e, win, payload) => {
    win.webContents.toggleDevTools()
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

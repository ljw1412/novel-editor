import { ipcMain } from 'electron'
import * as ConfigService from '../services/config'
import { createHandle, createListener } from '../services/ipc'

const channel = 'config'

const listener = createListener(channel, {})

const handle = createHandle(channel, {
  async getConfig(e, win, payload) {
    return ConfigService.getAll()
  },

  async setOption(e, win, payload) {
    const { key, value } = payload
    return ConfigService.set(key, value)
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

import { ipcMain } from 'electron'
import { createHandle, createListener } from '../services/ipc'
import * as ProjectService from '../services/project'

const channel = 'project'

const listener = createListener(channel, {})

const handle = createHandle(channel, {
  getDefaultProjectDir() {
    return ProjectService.APP_DEFAULT_PREJOCT_DIR
  },

  async createProject(e, win, data) {
    return await ProjectService.createProject(data as Editor.Project)
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

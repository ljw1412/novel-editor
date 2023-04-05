import { ipcMain } from 'electron'
import { createHandle, createListener } from '../services/ipc'
import * as ProjectService from '../services/project'

const channel = 'project'

const listener = createListener(channel, {})

const handle = createHandle(channel, {
  getDefaultProjectDir() {
    return ProjectService.getDefaultPrejectDir()
  },

  async createProject(e, win, data) {
    const { project } = data
    return await ProjectService.createProject(project as Editor.Project)
  },

  async openProject(e, win, data) {
    const { path } = data
    return await ProjectService.openProject(path)
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

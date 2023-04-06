import { ipcMain } from 'electron'
import { createHandle, createListener } from '../services/ipc'
import * as ProjectService from '../services/project'
import { handleWrap } from '../utils/function'
import storage from '../utils/storage'

storage.setDataPath(process.env.APP_DATA_PATH)

const channel = 'project'

const listener = createListener(channel, {})

const handle = createHandle(channel, {
  getDefaultProjectDir() {
    return ProjectService.getDefaultPrejectDir()
  },

  async createProject(e, win, data) {
    const { project } = data
    storage.setDataPath(project.path)
    return handleWrap(async () => {
      return await ProjectService.createProject(project as Editor.Project)
    })
  },

  async openProject(e, win, data) {
    const { path } = data
    storage.setDataPath(path)
    return handleWrap(async () => {
      return await ProjectService.openProject(path)
    })
  },

  async createVolume(e, win, data) {},

  async createChapter(e, win, data) {},

  async uploadImage(e, win, data) {}
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

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

  async createProject(e, win, payload) {
    const { project } = payload
    return handleWrap(() => {
      return ProjectService.createProject(project as Editor.Project)
    })
  },

  async openProject(e, win, payload) {
    const { path } = payload
    return handleWrap(() => {
      return ProjectService.openProject(path)
    })
  },

  async initData(e, win, payload) {
    const { names = [], path } = payload
    return handleWrap(() => {
      return ProjectService.initProjectData(path, names)
    })
  },

  async saveData(e, win, payload) {
    const { name, data, path } = payload
    return handleWrap(() => {
      return ProjectService.saveData(name, data, path)
    })
  },

  async getData(e, win, payload) {
    const { name, path } = payload
    return handleWrap(() => {
      return ProjectService.getData(name, path)
    })
  },

  async getManyData(e, win, payload) {
    const { names, path } = payload
    return handleWrap(() => {
      return ProjectService.getManyData(names, path)
    })
  },

  async hasNamesData(e, win, payload) {
    const { names, path } = payload
    return handleWrap(() => {
      return ProjectService.hasNamesData(names, path)
    })
  },

  async createVolume(e, win, payload) {},

  async createChapter(e, win, payload) {},

  async uploadImage(e, win, payload) {}
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

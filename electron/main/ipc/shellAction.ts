import { app, dialog, ipcMain, shell } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import { createHandle, createListener } from '../services/ipc'

const channel = 'shell'

const env = import.meta.env
const DesktopDir = app.getPath('desktop')
const shortcutLinkPath = path.join(DesktopDir, env.VITE_APP_TITLE + '.lnk')
const appPath = app.getPath('exe')

const listener = createListener(channel, {})

const handle = createHandle(channel, {
  getSeparator: () => {
    return path.sep
  },

  createAppShortcutLink: () => {
    return shell.writeShortcutLink(shortcutLinkPath, 'create', {
      target: appPath
    })
  },

  saveFile: async (e, win, data) => {
    try {
      const { content = '', filters } = data
      const result = await dialog.showSaveDialog({
        title: '保存文件',
        filters
      })
      if (!result.canceled && result.filePath) {
        await fsp.writeFile(result.filePath, content)
      }
      return result
    } catch (error) {
      return { err: true, error }
    }
  },

  selectDir: async (e, win, data) => {
    const { defaultPath } = data
    try {
      const result = await dialog.showOpenDialog({
        title: '选择文件夹',
        defaultPath,
        properties: ['openDirectory']
      })
      return result
    } catch (error) {
      return { err: true, error }
    }
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

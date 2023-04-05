import { app } from 'electron'
import { join } from 'node:path'
import fs from 'node:fs'

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//

const env: Record<string, any> = {}
env.DIST_ELECTRON = join(__dirname, '..')
env.DIST = join(env.DIST_ELECTRON, '../dist')
env.PUBLIC = import.meta.env.PROD
  ? process.env.DIST
  : join(env.DIST_ELECTRON, '../public')
// 应用程序(exe)所在的文件夹
env.APP_ROOT = import.meta.env.PROD
  ? join(app.getPath('exe'), '..')
  : app.getAppPath()
// 应用数据文件夹
env.APP_DATA_PATH = join(env.APP_ROOT, 'data')
// 项目默认保存文件夹
env.APP_DEFAULT_PROJECT_PATH = join(env.APP_DATA_PATH, 'projects')
fs.mkdirSync(env.APP_DEFAULT_PROJECT_PATH, { recursive: true })

Object.assign(process.env, env)

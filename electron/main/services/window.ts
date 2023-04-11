import { BrowserView, BrowserWindow } from 'electron'
import { join } from 'node:path'
import windowListener from '../listeners/windowListener'
import windowOpenHandler from '../listeners/windowOpenHandler'

const env = import.meta.env

/**
 * 组装Vue页面路由
 * @param path
 * @param query
 * @returns
 */
export function getVuePageUrl(path: string = '', query?: Record<string, any>) {
  const indexHtml = join(process.env.DIST, 'index.html')
  const baseUrl = process.env.VITE_DEV_SERVER_URL || indexHtml
  const hrefURL = new URL(baseUrl)
  hrefURL.hash = path.startsWith('/') ? `#${path}` : `#/${path}`
  let url = hrefURL.href
  if (query) {
    const searchParams = new URLSearchParams(query)
    url += '?' + searchParams.toString()
  }
  return url
}

interface BuiltInBrowserConfig {
  url: string
}

/**
 * 内置浏览器
 */
export class BuiltInBrowser {
  win: BrowserWindow
  view: BrowserView
  url: string

  constructor(config: BuiltInBrowserConfig) {
    this.win = new BrowserWindow({
      width: 1280,
      height: 720,
      minWidth: 640,
      minHeight: 480,
      frame: false,
      show: false,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js')
      }
    })

    this.url = getVuePageUrl('browser', { url: config.url })
    this.loadURL(this.url)

    windowListener(this.win)
    windowOpenHandler(this.win)

    this.view = new BrowserView()
    this.view.setBounds({ x: 1, y: 40, width: 1280 - 2, height: 720 - 40 - 1 })
    this.view.setAutoResize({ width: true, height: true })

    this.win.once('ready-to-show', () => {
      this.win.show()
      this.view.webContents.loadURL(config.url)
      windowOpenHandler(this.view)
      this.view.webContents.on('did-start-navigation', (e, url) => {
        this.win.webContents.send('page-updated', 'url', { url })
      })
      this.view.webContents.on('did-start-loading', (e) => {
        this.win.webContents.send('page-updated', 'loading', { loading: true })
      })
      this.view.webContents.on('did-stop-loading', (e) => {
        this.win.webContents.send('page-updated', 'loading', { loading: false })
      })
      this.view.webContents.on('page-title-updated', (e, title) => {
        this.win.webContents.send('page-updated', 'title', { title })
      })
      this.view.webContents.on('page-favicon-updated', (e, favicons) => {
        this.win.webContents.send('page-updated', 'favicons', {
          favicons
        })
      })
      this.win.setBrowserView(this.view)
      if (env.MODE === 'development') {
        this.win.webContents.openDevTools()
      }
    })

    this.win.on('close', () => {
      if (!this.view.webContents.isDestroyed()) {
        //@ts-ignore
        this.view.webContents.destroy()
      }
    })
  }

  loadURL(url: string, options?: Electron.LoadURLOptions) {
    this.win.loadURL(url, options)
  }
}

const DEFAULT_WINDOW_OPTIONS = {
  parent: null,
  modal: false,
  width: 1024,
  height: 576,
  frame: false,
  alwaysOnTop: false,
  backgroundColor: '#2a2a2b',
  show: false
}

/**
 * 窗体是否存在
 * @param title
 */
export function getWindowByName(name?: string) {
  if (!name) return null
  const allWindows = BrowserWindow.getAllWindows()
  const win = allWindows.find((win) => win.name === name) || null
  return win
}

/**
 * 合并窗体配置项
 * @param options
 * @returns
 */
function mergeWindowOptions(options: Electron.BrowserWindowConstructorOptions) {
  const mergedConfig = Object.assign({}, DEFAULT_WINDOW_OPTIONS, options)
  if (!mergedConfig.webPreferences) {
    mergedConfig.webPreferences = {}
  }
  mergedConfig.webPreferences.preload = join(__dirname, '../preload/index.js')
  return mergedConfig
}

/**
 * 显示对应名称的隐藏的窗体
 * @param name
 * @returns
 */
export function showWindowByName(name: string) {
  const win = getWindowByName(name)
  if (!win) return null
  if (!win.isVisible()) win.show()
  if (win.isMinimized()) win.restore()
  win.focus()
  return win
}

/**
 * 创建窗体
 * @param options
 * @param config
 * @returns
 */
export function createWindow(
  config: WindowConfig,
  options: Electron.BrowserWindowConstructorOptions = DEFAULT_WINDOW_OPTIONS
) {
  if (config.singleInstance && config.name) {
    const win = showWindowByName(config.name)
    if (win) return win
  }

  const win = new BrowserWindow(mergeWindowOptions(options))
  // 如果有则添加唯一标识符号
  if (config.name) win.name = config.name
  // 绑定基础监听
  windowListener(win)
  windowOpenHandler(win)
  win.loadURL(config.url)

  if (!config.silent) win.show()

  win.on('show', () => {
    if (env.DEV) win.webContents.openDevTools()
  })
  win.on('hide', () => {
    if (env.DEV && win.webContents.isDevToolsOpened) {
      win.webContents.closeDevTools()
    }
  })

  return win
}

/**
 * 预设的窗体
 */
interface PresetWindow {
  name: string
  config: WindowConfig
  options: Electron.BrowserWindowConstructorOptions
}

const presetWindows = [
  {
    name: '设置',
    config: { url: getVuePageUrl('/setting') },
    options: {
      width: 720,
      height: 540,
      resizable: false,
      maximizable: false,
      minimizable: false
    }
  }
] as PresetWindow[]

export const presetWindowNames = presetWindows.map((item) => item.name)

export function createPresetWindow(name: string) {
  const presetWindow = presetWindows.find((item) => item.name === name)
  if (!presetWindow) return null
  const { config, options } = presetWindow
  config.silent = true
  const win = createWindow(config, options)
  win.name = name
  win.isPreset = true
  win.on('close', (e) => {
    if (!win.isAppQuitting) {
      e.preventDefault()
      win.hide()
    }
  })
  return win
}

export function initPresetWindows() {
  return presetWindows.map((item) => createPresetWindow(item.name))
}

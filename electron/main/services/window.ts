import { BrowserView, BrowserWindow, ipcMain } from 'electron'
import { join } from 'node:path'
import windowListener from '../listeners/windowListener'
import windowOpenHandler from '../listeners/windowOpenHandler'

const env = import.meta.env

export function getPageUrl(path: string = '', query?: Record<string, any>) {
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

    this.url = getPageUrl('browser', { url: config.url })
    this.loadURL(this.url)

    windowListener(this.win)
    windowOpenHandler(this.win)

    this.view = new BrowserView()
    this.view.setBounds({ x: 0, y: 40, width: 1280, height: 720 - 40 })
    this.view.setAutoResize({ width: true, height: true })

    this.win.once('ready-to-show', () => {
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
      this.win.show()
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

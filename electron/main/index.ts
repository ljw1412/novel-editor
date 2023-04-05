import { app, BrowserWindow, shell, nativeTheme, dialog } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import IpcLoader from './ipc'
import windowListener from './listeners/windowListener'
import windowOpenHandler from './listeners/windowOpenHandler'
import { getPageUrl } from './services/window'

// 初始化APP环境变量和创建需要的文件夹
import './env'

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
let win: BrowserWindow | null = null
nativeTheme.themeSource = 'dark'
const env = import.meta.env
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')

function createWindow() {
  win = new BrowserWindow({
    title: '小说编辑器',
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    frame: false,
    backgroundColor: '#2a2a2b',
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // nodeIntegration: true,
      // contextIsolation: false
    }
  })

  const url = getPageUrl('main')
  win.loadURL(url)

  if (env.MODE === 'development') {
    win.webContents.openDevTools()
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
  return win
}

// Install "Vue.js devtools"
if (env.MODE === 'development') {
  app
    .whenReady()
    .then(() => import('electron-devtools-installer'))
    .then(({ default: installExtension, VUEJS3_DEVTOOLS }) =>
      installExtension(VUEJS3_DEVTOOLS, {
        loadExtensionOptions: {
          allowFileAccess: true
        }
      })
    )
    .catch((e) => console.error('Failed install extension:', e))
}

app.whenReady().then(() => {
  const win = createWindow()
  windowListener(win)
  windowOpenHandler(win)
  IpcLoader.bind()
})

app.on('window-all-closed', () => {
  IpcLoader.unbind()
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

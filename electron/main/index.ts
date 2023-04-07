import { app, BrowserWindow, shell, nativeTheme } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import './env'
import IpcLoader from './ipc'
import windowListener from './listeners/windowListener'
import windowOpenHandler from './listeners/windowOpenHandler'
import { getVuePageUrl, initPresetWindows } from './services/window'

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
      preload: join(__dirname, '../preload/index.js')
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // nodeIntegration: true,
      // contextIsolation: false
    }
  })

  const url = getVuePageUrl('main')
  win.loadURL(url)

  if (import.meta.env.DEV) {
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
if (import.meta.env.DEV) {
  app
    .whenReady()
    .then(() => import('electron-devtools-installer'))
    .then(({ default: installExtension }) =>
      // https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd
      installExtension('nhdogjmejiglipccpnnnanhbledajbpd', {
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
  const presetWindows = initPresetWindows()
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

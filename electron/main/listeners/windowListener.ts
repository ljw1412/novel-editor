import { BrowserWindow, IpcMainEvent } from 'electron'

export default function (win: BrowserWindow) {
  // win.on('ready-to-show', () => {
  //   win.webContents.executeJavaScript(`window.tabId=${win.id}`)
  // })

  win.on('maximize', (e: IpcMainEvent) => {
    e.sender.send('window', 'maximize')
  })

  win.on('unmaximize', (e: IpcMainEvent) => {
    e.sender.send('window', 'unmaximize')
  })

  win.on('focus', (e: IpcMainEvent) => {
    win.webContents.executeJavaScript(
      'document.body.setAttribute("app-status","focus")'
    )
  })

  win.on('blur', (e: IpcMainEvent) => {
    win.webContents.executeJavaScript(
      'document.body.removeAttribute("app-status")'
    )
  })
}

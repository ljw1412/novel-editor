import { BrowserView, BrowserWindow } from 'electron'
import { shell } from 'electron'
// import { createBrowser, createBuiltInBrowser } from '../window'
import AppConfig from '../config'
import { nin } from '../utils/object'
import qs from 'qs'
import { BuiltInBrowser, createWindow } from '../services/window'

export async function openExternal(url: string) {
  const HTTP_REGEXP = /^https?:\/\//
  // 非http协议不打开，防止出现自定义协议等导致的安全问题
  if (!HTTP_REGEXP.test(url)) {
    return false
  }
  try {
    await shell.openExternal(url)
    return true
  } catch (error) {
    console.error('open external error: ', error)
    return false
  }
}

export default function (win: BrowserWindow | BrowserView): void {
  win.webContents.setWindowOpenHandler(
    ({ url, frameName, disposition, referrer, features, postBody }) => {
      if (
        ['foreground-tab', 'background-tab', 'new-window'].includes(disposition)
      ) {
        console.log('[OpenHandler]', url)
        const serachParams: Record<string, any> = {}
        const [href, query] = url.split('?')
        if (query) {
          Object.assign(serachParams, qs.parse(query))
        }
        if (serachParams.app === 'novel-editor') {
          let winOptions = { minWidth: 1280, minHeight: 720 }
          if (serachParams['win-options']) {
            try {
              winOptions = JSON.parse(serachParams['win-options'])
            } catch (error) {
              console.error('winOptions 解析失败')
            }
          }
          url = href + '?' + qs.stringify(nin(serachParams, 'win-options'))
          createWindow({ url }, winOptions)
        } else if (AppConfig.use_system_browser) {
          openExternal(url)
        } else {
          new BuiltInBrowser({ url })
        }
      }
      return { action: 'deny' }
    }
  )
}

import { BrowserView, BrowserWindow } from 'electron'
import { shell } from 'electron'
// import { createBrowser, createBuiltInBrowser } from '../window'
import AppConfig from '../config'
import { nin } from '../utils/object'
import qs from 'qs'
import { BuiltInBrowser } from '../services/window'

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
        console.log(url)

        // let url = oUrl
        const serachParams: Record<string, any> = {}
        const [href, query] = url.split('?')
        if (query) {
          Object.assign(serachParams, qs.parse(query))
        }
        if (serachParams.app === 'novel-editor') {
          let appConfig = { minWidth: 1280, minHeight: 720 }
          if (serachParams['app-config']) {
            try {
              appConfig = JSON.parse(serachParams['app-config'])
            } catch (error) {
              console.error('appConfig 解析失败')
            }
          }
          url = href + '?' + qs.stringify(nin(serachParams, 'app-config'))
          // createBrowser({ ...appConfig, url })
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

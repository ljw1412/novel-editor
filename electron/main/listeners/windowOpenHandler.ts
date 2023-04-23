import { BrowserView, BrowserWindow } from 'electron'
import AppConfig from '../config'
import { nin } from '../utils/object'
import qs from 'qs'
import { BuiltInBrowser, createWindow, openExternal } from '../services/window'

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

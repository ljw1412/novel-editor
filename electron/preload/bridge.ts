import { contextBridge, ipcRenderer } from 'electron'
import pkg from '../../package.json'

const apiKey = 'bridge'

/**
 * 修复对象失去的prototype里的属性
 * electron 发送自定义类将复制值，但不会包含prototype
 * @param obj
 */
function freeze(obj: Object, key: string | string[]) {
  const keyList = typeof key === 'string' ? key.split(' ') : key
  const newObj = { ...obj }
  keyList.forEach((key) => {
    if (obj[key]) newObj[key] = obj[key]
  })
  return newObj
}

const api = {
  electron: {
    ipcRenderer: freeze(
      ipcRenderer,
      'on off once removeListener removeAllListeners'
    )
  },
  package: { version: pkg.version },
  versions: process.versions
}

contextBridge.exposeInMainWorld(apiKey, api)

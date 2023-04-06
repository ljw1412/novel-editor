import * as logger from '/@/utils/logger'
import { noop } from './assist'
import { Notification } from '@arco-design/web-vue'

const { ipcRenderer } = window.bridge.electron

interface IpcOptions {
  silent: boolean
}

export async function ipcInvoke<T = any>(
  channel: string,
  action: string,
  data: Record<string, any> = {},
  options: IpcOptions = { silent: false }
): Promise<T> {
  // data.tabId = window.tabId
  logger.send(`invoke => ${channel}`, action, data)
  const result = await ipcRenderer.invoke(channel, action, data)
  if (typeof result === 'object' && result.err) {
    logger.error(`invoke => ${channel}`, action, result)
    if (!options.silent && result.error) {
      Notification.remove('ipc-error')
      setTimeout(() => {
        Notification.error({
          id: 'ipc-error',
          title: '错误',
          content: result.error.message,
          position: 'bottomRight',
          closable: true
        })
      }, 0)
    }
    return Promise.reject(result.error)
  }
  logger.receive(`invoke => ${channel}`, action, result)
  return result
}

export function ipcSend(
  channel: string,
  action: string,
  data: Record<string, any> = {}
) {
  // data.tabId = window.tabId
  logger.send(`send => ${channel}`, action, data)
  ipcRenderer.send(channel, action, data)
}

export function ipcOn(channel: string, listener: IpcListener) {
  ipcRenderer.on(channel, (event, action, data) => {
    logger.receive(`on => ${channel}`, action, data)
    listener(event, action, data)
  })
}

export function ipcOff(channel: string, listener: IpcListener = noop) {
  ipcRenderer.off(channel, listener)
}

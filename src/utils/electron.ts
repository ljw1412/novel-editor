import * as logger from '/@/utils/logger'
import { noop } from './assist'

const { ipcRenderer } = window.bridge.electron

export async function ipcInvoke<T = any>(
  channel: string,
  action: string,
  data: Record<string, any> = {}
): Promise<T> {
  // data.tabId = window.tabId
  logger.send(`invoke => ${channel}`, action, data)
  const result = await ipcRenderer.invoke(channel, action, data)
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

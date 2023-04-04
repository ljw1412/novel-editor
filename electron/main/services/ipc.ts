import { WebContents, BrowserWindow } from 'electron'

// 返回 true 为中断后续监听
type BeforeListener = (
  event: Electron.IpcMainEvent,
  action: string,
  data?: Record<string, any>
) => boolean | undefined
type BeforeInvokeListener = (
  event: Electron.IpcMainInvokeEvent,
  action: string,
  data?: Record<string, any>
) => boolean | undefined

export function getSenderOwner(sender: WebContents): BrowserWindow {
  // @ts-ignore
  return sender.getOwnerBrowserWindow ? sender.getOwnerBrowserWindow() : null
}

export function createListener(
  channel: string,
  actions: Record<string, IpcAction>,
  before?: BeforeListener
): IpcListener {
  return async (e, action, data) => {
    console.log(`[${channel}:on]#${action} ${data}`)
    if (before && (await before(e, action, data))) return
    const win = getSenderOwner(e.sender)
    const fn = actions[action]
    if (!fn) {
      const message = `action=${action}的监听处理不存在！`
      console.log(`[${channel}:on] ${message}`)
      return new Error(message)
    }
    return await fn(e, win, data)
  }
}

export function createHandle(
  channel: string,
  actions: Record<string, IpcInvokeAction>,
  before?: BeforeInvokeListener
): IpcInvokeListener {
  return async (e, action, data) => {
    console.log(`[${channel}:handle] #${action}`, data)
    if (before && (await before(e, action, data))) return
    const win = getSenderOwner(e.sender)
    const fn = actions[action]
    if (!fn) {
      console.log(`[${channel}:handle] action=${action}的监听处理不存在！`)
      return
    }
    return await fn(e, win, data)
  }
}

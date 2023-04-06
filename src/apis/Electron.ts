import type { RouteLocationRaw } from 'vue-router'
import { ipcInvoke, ipcSend } from '/@/utils/ipc'
import * as logger from '/@/utils/logger'

/**
 * 获取项目的默认文件夹
 * @returns
 */
export async function getDefaultDir() {
  return ipcInvoke<string>('project', 'getDefaultProjectDir')
}

/**
 * 创建项目
 * @param project
 * @returns
 */
export async function createProject(project: Editor.Project) {
  return ipcInvoke<Editor.Project>('project', 'createProject', { project })
}

/**
 * 打开项目
 * @param path
 * @returns
 */
export async function openProject(path: string) {
  return ipcInvoke<Editor.Project>('project', 'openProject', { path })
}

/**
 * 获取系统路径的分隔符号
 * @returns
 */
export async function getSeparator() {
  return ipcInvoke<string>('shell', 'getSeparator')
}

/**
 * 选择文件夹
 * @param options
 * @returns
 */
export async function selectDir(options?: { defaultPath: string }) {
  return ipcInvoke('shell', 'selectDir', options)
}

export const win = {
  channel: 'window',
  /**
   * 操作当前窗体
   * @param action
   * @param mode
   */
  control(
    action: 'minimize' | 'toggleMaximize' | 'close' | 'toggleDevTools',
    who: string = 'child'
  ) {
    return ipcInvoke(this.channel, action, { who })
  },
  /**
   * 创建窗体
   * @param config
   * @param options
   */
  create(
    config: WindowConfig,
    options: Electron.BrowserWindowConstructorOptions
  ) {
    ipcSend(this.channel, 'create', { config, options })
  },
  /**
   * 用内置浏览器或系统默认浏览器打开页面
   * @param url
   * @param options
   */
  open(
    config: WindowConfig,
    options: Electron.BrowserWindowConstructorOptions
  ) {
    // const action = appConfig.useSystemBrowser
    //   ? 'openSystemBrowser'
    //   : 'openBuiltInBrowser'
    const action = 'openBuiltInBrowser'
    ipcSend(this.channel, action, { config, options })
  },
  /**
   * 打开Vue路由页面窗体
   * @param to
   * @param options
   * @returns
   */
  openVue(
    to: RouteLocationRaw,
    options: Record<string, any> = { minWidth: 800, minHeight: 600 }
  ) {
    if (typeof to === 'string') return
    const query = Object.assign(
      { app: 'novel-editor', 'win-options': JSON.stringify(options) },
      to.query
    )
    const mTo = Object.assign({}, to, { query })
    logger.message('openVue', mTo)
    const route = window.$router.resolve(mTo)
    window.open(route.href, '_blank')
  },
  /**
   * 打开程序系统内置的二级窗体
   * @param name 可选值: 退出程序 系统设置
   */
  openPresetWindow(name: string) {
    ipcSend(this.channel, 'openPresetWindow', { name })
  }
}

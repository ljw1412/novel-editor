import { ipcInvoke } from '../utils/electron'

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

import storage from '../utils/storage'

const CONFIG_FILENAME = 'project'

export function getDefaultPrejectDir() {
  return process.env.APP_DEFAULT_PROJECT_PATH
}

export async function createProject(project: Editor.Project) {
  const isExists = await storage.has(CONFIG_FILENAME)
  if (isExists) {
    throw new Error('该保存位置已经存在项目，请更换保存位置或修改项目名称')
  }
  if (!project.createTime) project.createTime = +new Date()
  storage.set(CONFIG_FILENAME, project)
  return storage.get(CONFIG_FILENAME)
}

export async function openProject(dir: string) {
  const isExists = await storage.has(CONFIG_FILENAME)
  if (!isExists) {
    throw new Error('该项目可能已经移除')
  }
  return storage.get(CONFIG_FILENAME)
}

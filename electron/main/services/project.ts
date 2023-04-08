import storage from '../utils/storage'
import ApiError from '/@/classes/ApiError'

const CONFIG_FILENAME = 'project'

export function getDefaultPrejectDir() {
  return process.env.APP_DEFAULT_PROJECT_PATH
}

const INIT_FILE_MAP = {
  'world.summary': [{ title: '故事背景', content: '', children: [] }],
  'world.timeline': [],
  'world.keywords': []
}

export async function initProjectData(dataPath: string, names?: string[]) {
  return Promise.allSettled(
    (names || Object.keys(INIT_FILE_MAP)).map((key) => {
      const data = INIT_FILE_MAP[key]
      if (!data) {
        return Promise.reject({
          name: key,
          message: `“${key}”未设置初始化的数据。`
        })
      }
      return storage.set(key, data, { dataPath })
    })
  )
}

export async function createProject(project: Editor.Project) {
  const { path: dataPath } = project
  const isExists = await storage.has(CONFIG_FILENAME, { dataPath })
  if (isExists) {
    throw new Error('该保存位置已经存在项目，请更换保存位置或修改项目名称')
  }
  if (!project.createTime) project.createTime = +new Date()
  await storage.set(CONFIG_FILENAME, project, { dataPath })
  await initProjectData(dataPath)
  return storage.get(CONFIG_FILENAME, { dataPath })
}

export async function openProject(dataPath: string) {
  const isExists = await storage.has(CONFIG_FILENAME, { dataPath })
  if (!isExists) {
    const error = new ApiError(
      '路径不存在',
      `此计算机上不存在路径“${dataPath}”。`,
      { isRemoved: true }
    )
    throw error
  }
  return storage.get(CONFIG_FILENAME, { dataPath })
}

export function saveData(name: string, data: object, dataPath: string) {
  return storage.set(name, data, { dataPath })
}

export function getData(name: string, dataPath: string) {
  return storage.get(name, { dataPath })
}

export function getManyData(names: string[], dataPath: string) {
  return storage.getMany(names, { dataPath })
}

export async function hasNamesData(names: string[], dataPath: string) {
  const keys = await storage.keys({ dataPath })
  return names.reduce((obj, key) => {
    obj[key] = keys.includes(key)
    return obj
  }, {})
}

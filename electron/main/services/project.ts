import fsp from 'node:fs/promises'
import { join, relative } from 'node:path'
import { nin } from '../utils/object'
import storage from '../utils/storage'
import ApiError from '/@/classes/ApiError'

const CONFIG_FILENAME = 'project'

export function getDefaultPrejectDir() {
  return process.env.APP_DEFAULT_PROJECT_PATH
}

const INIT_FILE_MAP = {
  'world.summary': [
    { title: '故事背景', content: '', action: 'summary' },
    { title: '注意事项', content: '', action: 'summary' }
  ],
  'world.timeline': [],
  'world.keywords': [],
  character: []
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
      '无效项目路径',
      `项目配置文件(project.json)不存在于“${dataPath}”。`,
      { isRemoved: true }
    )
    throw error
  }
  const project = await storage.get(CONFIG_FILENAME, { dataPath })
  if (project.path !== dataPath) {
    project.path = dataPath
    await storage.set(CONFIG_FILENAME, project, { dataPath })
  }
  return project
}

export async function updateProject(
  dataPath: string,
  data: Record<string, any>
) {
  const project = await openProject(dataPath)
  Object.assign(project, nin(data, 'path'))
  await storage.set(CONFIG_FILENAME, project, { dataPath })
  return project
}

export function saveData(name: string, data: object, dataPath: string) {
  return storage.set(name, data, { dataPath })
}

export async function getData(name: string, dataPath: string) {
  try {
    return storage.get(name, { dataPath })
  } catch (error) {
    throw new ApiError('错误', '数据文件可能损坏，无法解析！')
  }
}

export async function getManyData(names: string[], dataPath: string) {
  try {
    return await storage.getMany(names, { dataPath })
  } catch (error) {
    throw new ApiError('错误', '部分数据文件可能损坏，无法解析！')
  }
}

export async function hasData(name: string, dataPath: string) {
  return storage.has(name, { dataPath })
}

export async function hasNamesData(names: string[], dataPath: string) {
  const keys = await storage.keys({ dataPath })
  return names.reduce((obj, key) => {
    obj[key] = keys.includes(key)
    return obj
  }, {})
}

export async function saveImage(data: string, name: string, dataPath: string) {
  const imageDir = join(dataPath, 'images')
  await fsp.mkdir(imageDir, { recursive: true })
  const imagePath = join(imageDir, name)
  const [, base64Data] = data.split('base64,')
  await fsp.writeFile(imagePath, new Buffer(base64Data, 'base64'))
  return relative(dataPath, imagePath)
}

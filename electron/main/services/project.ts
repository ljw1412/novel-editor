import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import fsp from 'node:fs/promises'

const CONFIG_FILENAME = 'project.novelprj'

export const APP_DATA_PATH = path.join(app.getAppPath(), 'data')
export const APP_DEFAULT_PREJOCT_DIR = path.join(APP_DATA_PATH, 'projects')
fs.mkdirSync(APP_DEFAULT_PREJOCT_DIR, { recursive: true })

export async function createProject(project: Editor.Project) {
  const { path: prjDir } = project
  if (!project.createTime) project.createTime = +new Date()
  await fsp.mkdir(prjDir, { recursive: true })
  const filePath = path.join(prjDir, CONFIG_FILENAME)
  const isExists = fs.existsSync(filePath)
  if (isExists) {
    return {
      err: true,
      error: new Error('该保存位置已经存在项目，请更换保存位置或修改项目名称')
    }
  }
  await fsp.writeFile(filePath, JSON.stringify(project))
  return project
}

export async function openProject(prjDir: string) {
  const filePath = path.join(prjDir, CONFIG_FILENAME)
  const isExists = fs.existsSync(filePath)
  if (!isExists) {
    return {
      err: true,
      error: new Error('该项目可能已经移除')
    }
  }
  const text = await fsp.readFile(filePath)
  return JSON.parse(text.toString('utf8'))
}

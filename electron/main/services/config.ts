import config from '/@/config'

import storage from '../utils/storage'

console.log(storage.getDataPath())

const CONFIG_FILENAME = 'config'

export async function init() {
  const isExists = await storage.has(CONFIG_FILENAME)
  if (!isExists) {
    await storage.set(CONFIG_FILENAME, storage)
    return
  }
  const configInFile = await storage.get(CONFIG_FILENAME)
  return Object.assign(storage, configInFile)
}

export async function getAll() {
  return config
}

export async function get(key: string) {
  return config[key]
}

export async function set(key: string, value: any) {
  config[key] = value
  await storage.set(CONFIG_FILENAME, config)
  return config
}

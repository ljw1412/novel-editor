import { promisify } from 'util'
import storage, { DataOptions } from 'electron-json-storage'

interface StoragePromisified {
  get: (key: string, options?: DataOptions) => Promise<object>
  getMany: (keys: string[], options?: DataOptions) => Promise<object>
  getAll: (options?: DataOptions) => Promise<object>
  set: (key: string, json: object, options?: DataOptions) => Promise<void>
  has: (key: string, options?: DataOptions) => Promise<boolean>
  keys: (options?: DataOptions) => Promise<string[]>
  remove: (key: string, options?: DataOptions) => Promise<void>
  clear: (options?: DataOptions) => Promise<void>
}

const promisified: StoragePromisified = {
  get: promisify(storage.get),
  getMany: promisify(storage.getMany),
  getAll: promisify(storage.getAll),
  set: promisify(storage.set),
  has: promisify<string, boolean>(storage.has),
  keys: promisify<string[]>(storage.keys),
  remove: promisify(storage.remove),
  clear: promisify(storage.clear)
}

export default {
  getDefaultDataPath: storage.getDefaultDataPath,
  setDataPath: storage.setDataPath,
  getDataPath: storage.getDataPath,
  getSync: storage.getSync,
  ...promisified
}

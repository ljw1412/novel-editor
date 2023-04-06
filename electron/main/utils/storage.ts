import { promisify } from 'util'
import storage from 'electron-json-storage'

export default {
  getDefaultDataPath: storage.getDefaultDataPath,
  setDataPath: storage.setDataPath,
  getDataPath: storage.getDataPath,
  getSync: storage.getSync,
  get: promisify<string, object>(storage.get),
  getMany: promisify<string[], object>(storage.getMany),
  getAll: promisify<object>(storage.getAll),
  set: promisify(storage.set),
  has: promisify<string, boolean>(storage.has),
  keys: promisify<string[]>(storage.keys),
  remove: promisify(storage.remove),
  clear: promisify(storage.clear)
}

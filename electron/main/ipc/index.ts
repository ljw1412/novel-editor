interface ActionModule {
  default: { bind: () => void; unbind: () => void }
}

const modules = import.meta.glob<ActionModule>(`./*.ts`, {
  eager: true
})

const ipcActionList = Object.keys(modules).map((path) => modules[path].default)

export function bind() {
  ipcActionList.forEach((action) => action.bind())
}

export function unbind() {
  ipcActionList.forEach((action) => action.unbind())
}

export default { bind, unbind }

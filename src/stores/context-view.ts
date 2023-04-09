import { defineStore } from 'pinia'

interface ContextOptions {
  menuList: CtxMenu.Item[]
  position: CtxMenu.Position
  callback: (item: CtxMenu.Item | null) => void
}

export const useContextViewStore = defineStore('contextViewStore', {
  state: () => ({
    isDisplay: false,
    menuList: [] as CtxMenu.Item[],
    position: {} as CtxMenu.Position,
    callback: (item: CtxMenu.Item | null) => {}
  }),

  getters: {
    positionStyles(state) {
      const styles: Record<string, string> = {}
      Object.keys(state.position).forEach((key) => {
        styles[key] = state.position[key as keyof CtxMenu.Position] + 'px'
      })
      return styles
    }
  },

  actions: {
    showContextMenu({ menuList, position, callback }: ContextOptions) {
      this.isDisplay = true
      this.menuList = menuList
      this.position = position
      this.callback = callback
    }
  }
})

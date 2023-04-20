import { defineStore } from 'pinia'

interface ContextOptions {
  menuList: Editor.CtxMenu.Item[]
  position: Editor.CtxMenu.Position
  callback: (item: Editor.CtxMenu.Item | null) => void
}

export const useContextViewStore = defineStore('contextViewStore', {
  state: () => ({
    isDisplay: false,
    menuList: [] as Editor.CtxMenu.Item[],
    position: {} as Editor.CtxMenu.Position,
    callback: (item: Editor.CtxMenu.Item | null) => {}
  }),

  getters: {
    positionStyles(state) {
      const styles: Record<string, string> = {}
      Object.keys(state.position).forEach((key) => {
        styles[key] =
          state.position[key as keyof Editor.CtxMenu.Position] + 'px'
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

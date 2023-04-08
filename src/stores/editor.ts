import { defineStore } from 'pinia'
import Page from '/@/classes/Page'

export const useEditorStore = defineStore('EditorStore', {
  state: () =>
    ({
      bookshelf: { data: null },
      character: { data: null },
      world: { data: null },
      info: { data: null }
    } as Record<
      SidebarActions,
      { data: null | { page: Page; parentPage?: Page } }
    >),

  getters: {},

  actions: {
    switchPage(action: SidebarActions, page: Page, parentPage?: Page) {
      this[action].data = { page, parentPage }
    }
  }
})

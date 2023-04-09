import { defineStore } from 'pinia'
import type { RouteLocationRaw } from 'vue-router'
import { only } from '../utils/object'
import Page from '/@/classes/Page'

type ModuleData = null | { page: Page; parentPage?: Page }
interface PaneItem {
  key: string
  title: string
  list: Page[]
  placeholder?: string
  childPlaceholder?: string
  allowAdd: boolean
  allowAddChild: boolean
}

export const useEditorStore = defineStore('EditorStore', {
  state: () => ({
    bookshelf: {
      key: 'bookshelf',
      label: '小说',
      icon: 'icon-bookmark',
      route: { name: 'EditorBookshelf' },
      currentRoute: null as null | RouteLocationRaw,
      data: null as ModuleData
    },
    world: {
      key: 'world',
      label: '世界观',
      icon: 'icon-common',
      route: { name: 'EditorWorld' },
      currentRoute: null as null | RouteLocationRaw,
      data: null as ModuleData,
      panes: {
        summary: {
          key: 'summary',
          title: '简介 / summary',
          list: [] as Page[],
          allowAdd: false,
          allowAddChild: false
        },
        timeline: {
          key: 'timeline',
          title: '时间线 / timeline',
          list: [] as Page[],
          placeholder: '输入历法名称，如：公元、宇宙历',
          childPlaceholder: '请输入年份',
          allowAdd: true,
          allowAddChild: true
        },
        keywords: {
          key: 'keywords',
          title: '关键词 / keywords',
          list: [] as Page[],
          placeholder: '输入关键词名称',
          allowAdd: true,
          allowAddChild: false
        }
      } as Record<Editor.World.PaneType, PaneItem>
    },
    character: {
      key: 'character',
      label: '人物',
      icon: 'icon-user-group',
      route: { name: 'EditorCharacter' },
      currentRoute: null as null | RouteLocationRaw,
      data: null as ModuleData
    },
    info: {
      key: 'info',
      label: '基础信息',
      icon: 'icon-info-circle',
      route: { name: 'EditorInfo' },
      currentRoute: null as null | RouteLocationRaw,
      data: null as ModuleData
    }
  }),

  getters: {
    actions(state) {
      return Object.values(
        only(state, ['bookshelf', 'world', 'character', 'info'])
      )
    },

    worldPaneList(state) {
      return Object.values(state.world.panes)
    }
  },

  actions: {
    switchPage(action: Editor.SidebarActions, page: Page, parentPage?: Page) {
      this[action].data = { page, parentPage }
    },

    getActionRoute(action: Editor.SidebarActions) {
      return this[action].currentRoute || this[action].route
    }
  }
})

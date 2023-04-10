import { defineStore } from 'pinia'
import type { RouteLocationRaw } from 'vue-router'
import * as logger from '/@/utils/logger'
import { only } from '../utils/object'
import { useProjectStore } from './project'
import $API from '/@/apis'
import Page from '/@/classes/Page'
import CharacterPage from '/@/classes/CharacterPage'

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
      currentRoute: null as RouteLocationRaw | null,
      data: null as { page: Page; parentPage?: Page } | null
    },
    world: {
      key: 'world',
      label: '世界观',
      icon: 'icon-common',
      route: { name: 'EditorWorld' },
      currentRoute: null as RouteLocationRaw | null,
      data: null as { page: Page; parentPage?: Page } | null,
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
      currentRoute: null as RouteLocationRaw | null,
      data: null as { page: CharacterPage } | null,
      list: [] as CharacterPage[]
    },
    info: {
      key: 'info',
      label: '基础信息',
      icon: 'icon-info-circle',
      route: { name: 'EditorInfo' },
      currentRoute: null as RouteLocationRaw | null,
      data: null as { page: Page; parentPage?: Page } | null
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

    getAction(action: Editor.SidebarActions) {
      return this[action] || ({} as Record<string, any>)
    },

    getActionRoute(action: Editor.SidebarActions) {
      const { data, currentRoute, route } = this[action]
      return data && currentRoute ? currentRoute : route
    },

    async saveActionData(action: 'character') {
      const path = useProjectStore().project.path
      if (!this[action]) {
        logger.error('saveActionData', `action=${action}不存在`)
        return
      }
      const list = this[action].list
      const data = list.map((item: Page) => item.toObject())
      return await $API.Electron.project.saveData(action, data, path)
    },

    getWorldPane(key: Editor.World.PaneType) {
      return this.world.panes[key] || { list: [] }
    },

    getWorldPaneData(key: string) {
      return this.getWorldPane(key as Editor.World.PaneType).list
    },

    async saveWorldPaneData(action: string) {
      const path = useProjectStore().project.path
      const list = this.getWorldPaneData(action)
      const data = list.map((item) => item.toObject())
      return await $API.Electron.project.saveData(`world.${action}`, data, path)
    }
  }
})

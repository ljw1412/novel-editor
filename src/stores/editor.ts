import { defineStore } from 'pinia'
import type { RouteLocationRaw } from 'vue-router'
import * as logger from '/@/utils/logger'
import $API from '/@/apis'
import Page, { PageObject } from '/@/classes/Page'
import CharacterPage, { CharacterPageObject } from '/@/classes/CharacterPage'
import { useProjectStore } from './index'
import { Notification } from '@arco-design/web-vue'
import { only } from '../utils/object'

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
          title: '简介',
          list: [] as Page[],
          allowAdd: false,
          allowAddChild: false
        },
        timeline: {
          key: 'timeline',
          title: '时间线',
          list: [] as Page[],
          placeholder: '输入历法名称，如：公元、宇宙历',
          childPlaceholder: '请输入年份',
          allowAdd: true,
          allowAddChild: true
        },
        keywords: {
          key: 'keywords',
          title: '关键词',
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
    project() {
      return useProjectStore().project
    },

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
    getAction(action: Editor.SidebarActions) {
      return this[action] || ({} as Record<string, any>)
    },

    getActionRoute(action: Editor.SidebarActions) {
      const { data, currentRoute, route } = this[action]
      return data && currentRoute ? currentRoute : route
    },

    getWorldPaneData(key: Editor.World.PaneType | string) {
      const pane = this.world.panes[key as Editor.World.PaneType]
      const { list = [] } = pane
      return list
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

    async saveWorldPaneData(action: string) {
      const path = this.project.path
      const list = this.getWorldPaneData(action)
      const data = list.map((item) => item.toObject())
      return await $API.Electron.project.saveData(`world.${action}`, data, path)
    },

    async loadBookshelfData() {},

    async loadCharacterData() {
      const moduleName = 'character'
      const path = this.project.path
      const exists = await $API.Electron.project.hasData(moduleName, path)
      if (!exists) {
        logger.warning('缺失的数据文件：', moduleName)
        await $API.Electron.project.initData(moduleName, path)
        Notification.info({
          title: '角色数据文件不完整，现已修改。',
          content: moduleName,
          position: 'bottomRight',
          duration: 10 * 1000,
          closable: true
        })
      }
      let data = await $API.Electron.project.getData(moduleName, path)
      data = data.map((page: CharacterPageObject) => CharacterPage.create(page))
      const characterList = this.character.list
      characterList.length = 0
      characterList.push(...data)
    },

    async loadWorldData() {
      const names = this.worldPaneList.map((item) => `world.${item.key}`)
      const path = this.project.path
      const existsData = await $API.Electron.project.hasNamesData(names, path)
      const notExistsNames = Object.keys(existsData).filter(
        (key) => !existsData[key]
      )
      if (notExistsNames.length) {
        logger.warning('缺失的数据文件：', notExistsNames)
        await $API.Electron.project.initData(notExistsNames, path)
        Notification.info({
          title: '世界观数据文件不完整，现已修改。',
          content: notExistsNames.join('\n'),
          position: 'bottomRight',
          duration: 10 * 1000,
          closable: true
        })
      }
      const { world } = await $API.Electron.project.getManyData(names, path)
      Object.keys(world).forEach((key) => {
        const data = world[key].map((page: PageObject) => Page.create(page))
        const list = this.getWorldPaneData(key)
        if (Array.isArray(list)) {
          list.length = 0
          list.push(...data)
        }
      })
    },

    async loadInfoData() {},

    switchPage(action: Editor.SidebarActions, page: Page, parentPage?: Page) {
      this.getAction(action).data = { page, parentPage }
    }
  }
})

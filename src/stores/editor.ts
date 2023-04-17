import { defineStore } from 'pinia'
import type { RouteLocationRaw } from 'vue-router'
import * as logger from '/@/utils/logger'
import $API from '/@/apis'
import Page, { PageObject } from '/@/classes/BasePage'
import Volume, { VolumeObject } from '/@/classes/Volume'
import Chapter, { ChapterObject } from '/@/classes/Chapter'
import WorldItem, { WorldItemObject } from '/@/classes/WorldItem'
import Character, { CharacterObject } from '/@/classes/Character'
import { useProjectStore } from './index'
import { Notification } from '@arco-design/web-vue'
import { only } from '../utils/object'

interface PaneItem {
  key: string
  title: string
  list: WorldItem[]
  placeholder?: string
  childPlaceholder?: string
  allowAdd: boolean
  allowAddChild: boolean
}

const STATUS_DEFAULT_MAP = {
  loading: {
    status: 'loading',
    icon: 'icon-loading',
    color: 'text-yellow-500'
  },
  success: {
    status: 'success',
    icon: 'icon-check',
    color: 'text-green-500'
  },
  error: {
    status: 'error',
    icon: 'icon-close',
    color: 'text-red-500'
  },
  info: {
    status: 'info',
    icon: 'icon-info',
    color: ''
  }
}

interface ActionItem<T extends Page, P = T> {
  key: string
  label: string
  icon: string
  route: RouteLocationRaw
  currentRoute: RouteLocationRaw | null
  data: null | { page: T; parentPage?: P }
  list: (P | T)[]
}
type ActionBookshelf = ActionItem<Chapter, Volume>
type ActionWorld = ActionItem<WorldItem> & {
  panes: Record<Editor.World.PaneType, PaneItem>
}
type ActionCharacter = ActionItem<Character>
type ActionInfo = ActionItem<Page>

interface EditorState {
  status: string
  icon: string
  color: string
  message: string
  timer: null | number
}

interface EditorStoreState {
  bookshelf: ActionItem<Chapter, Volume>
  world: ActionWorld
  character: ActionCharacter
  info: ActionInfo
  state: EditorState
}

export const useEditorStore = defineStore('EditorStore', {
  state: (): EditorStoreState => ({
    bookshelf: {
      key: 'bookshelf',
      label: '小说',
      icon: 'icon-bookmark',
      route: { name: 'EditorBookshelf' },
      currentRoute: null,
      data: null,
      list: []
    },
    world: {
      key: 'world',
      label: '世界观',
      icon: 'icon-common',
      route: { name: 'EditorWorld' },
      currentRoute: null,
      data: null,
      list: [],
      panes: {
        summary: {
          key: 'summary',
          title: '简介',
          list: [],
          allowAdd: false,
          allowAddChild: false
        },
        timeline: {
          key: 'timeline',
          title: '时间线',
          list: [],
          placeholder: '输入历法名称，如：公元、宇宙历',
          childPlaceholder: '请输入年份',
          allowAdd: true,
          allowAddChild: true
        },
        keywords: {
          key: 'keywords',
          title: '关键词',
          list: [],
          placeholder: '输入关键词名称',
          allowAdd: true,
          allowAddChild: false
        }
      }
    },
    character: {
      key: 'character',
      label: '人物',
      icon: 'icon-user-group',
      route: { name: 'EditorCharacter' },
      currentRoute: null,
      data: null,
      list: []
    },
    info: {
      key: 'info',
      label: '项目',
      icon: 'icon-info-circle',
      route: { name: 'EditorInfo' },
      currentRoute: null,
      data: null,
      list: []
    },
    state: {
      status: '',
      icon: '',
      color: '',
      message: '',
      timer: null as null | number
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
    getAction(
      action: Editor.ActivityActions
    ): ActionBookshelf | ActionWorld | ActionCharacter | ActionInfo {
      return this[action]
    },

    getActionRoute(action: Editor.ActivityActions) {
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

    async saveWorldPaneData(type: string) {
      const path = this.project.path
      const list = this.getWorldPaneData(type)
      const data = list.map((item) => item.toObject())
      return await $API.Electron.project.saveData(`world.${type}`, data, path)
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
      data = data.map((page: CharacterObject) => new Character(page))
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
        const data = world[key].map(
          (page: WorldItemObject) => new WorldItem(page)
        )
        const list = this.getWorldPaneData(key)
        if (Array.isArray(list)) {
          list.length = 0
          list.push(...data)
        }
      })
    },

    async loadInfoData() {},

    switchPage(action: Editor.ActivityActions, page: Page, parentPage?: Page) {
      this.getAction(action).data = { page, parentPage }
    },

    setState(
      status: keyof typeof STATUS_DEFAULT_MAP,
      message: string,
      timeout = 3000
    ) {
      if (this.state.timer) {
        window.clearTimeout(this.state.timer)
        this.state.timer = null
      }
      Object.assign(this.state, { message }, STATUS_DEFAULT_MAP[status])
      if (timeout > 0) {
        this.state.timer = window.setTimeout(() => {
          if (this.state.timer) window.clearTimeout(this.state.timer)
          this.$patch({
            state: {
              status: '',
              icon: '',
              color: '',
              message: '',
              timer: null
            }
          })
        }, timeout)
      }
    }
  }
})

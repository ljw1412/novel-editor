import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import $API from '/@/apis'

const themeList = [
  { name: '蓝色', value: '', type: 'light', variable: '--skin-blue' },
  { name: '青色', value: 'cyan', type: 'light', variable: '--skin-cyan' },
  { name: '红色', value: 'red', type: 'light', variable: '--skin-red' },
  { name: '橙色', value: 'orange', type: 'light', variable: '--skin-orange' },
  { name: '粉色', value: 'pink', type: 'light', variable: '--skin-pink' },
  { name: '绿色', value: 'green', type: 'light', variable: '--skin-green' },
  { name: '水鸭绿', value: 'teal', type: 'light', variable: '--skin-teal' },
  { name: '古铜棕', value: 'brown', type: 'light', variable: '--skin-brown' },
  { name: '兄弟紫', value: 'purple', type: 'light', variable: '--skin-purple' },
  { name: '颐堤蓝', value: 'indigo', type: 'light', variable: '--skin-indigo' },
  {
    name: '低调灰',
    value: 'blue-grey',
    type: 'light',
    variable: '--skin-blue-grey'
  },
  { name: '黑暗', value: 'dark', type: 'dark', variable: '--skin-dark' }
]

const theme = useLocalStorage('APP_THEME', {
  now: 'dark',
  before: ''
})

const view = useLocalStorage('APP_VIEW', {
  sidebar: {
    activity: '' as Editor.Activity.Types,
    width: 300,
    isCollapsed: false,
    state: {
      worldPane: ''
    }
  }
})

const appConfig = useLocalStorage('APP_CONFIG', {} as Record<string, any>)

export const useConfigStore = defineStore('configStore', {
  state: () => ({ app: appConfig, view, theme, themeList }),

  getters: {
    sidebar: (state) => state.view.sidebar,
    isDarkMode: (state) => state.theme.now === 'dark'
  },

  actions: {
    /**
     * 切换黑暗模式
     */
    toggleDarkMode() {
      const currentTheme = this.theme.now || ''
      this.theme.now = this.isDarkMode ? this.theme.before : 'dark'
      this.theme.before = currentTheme
      this.flushBodyTheme()
    },
    /**
     * 切换主题
     * @param theme
     */
    switchTheme(theme: string) {
      if (this.theme.now === theme) return
      this.theme.before = this.theme.now
      this.theme.now = theme
      this.flushBodyTheme()
    },
    /**
     * 刷新页面主题
     */
    flushBodyTheme() {
      document.body.setAttribute('arco-theme', this.theme.now)
    },

    async loadAppConfig() {
      this.app = await $API.Electron.config.getConfig()
    },

    async setAppConfigOption(key: string, value: any) {
      await $API.Electron.config.setOption(key, value)
    }
  }
})

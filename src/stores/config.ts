import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

const config = useLocalStorage('APP_CONFIG', {
  theme: { now: 'dark', before: '' },
  sidebar: { tab: '', width: 300, isCollapsed: false }
})

export const useConfigStore = defineStore('configStore', {
  state: () => ({ config }),

  getters: {
    theme: (state) => state.config.theme,
    sidebar: (state) => state.config.sidebar,
    isDarkMode: (state) => state.config.theme.now === 'dark'
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
     * 刷新页面主题
     */
    flushBodyTheme() {
      document.body.setAttribute('arco-theme', this.theme.now)
    }
  }
})

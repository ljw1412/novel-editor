import { defineStore } from 'pinia'
import { useLocalStorage, toReactive } from '@vueuse/core'
import { ipcInvoke } from '/@/utils/electron'

const config = toReactive(
  useLocalStorage('APP_CONFIG', {
    theme: { now: 'dark', before: '' }
  })
)

export const useConfigStore = defineStore('configStore', {
  state: () => ({}),

  getters: {
    theme() {
      return config.theme.now
    },
    isDarkMode() {
      return config.theme.now === 'dark'
    }
  },
  actions: {
    toggleDarkMode() {
      const currentTheme = this.theme || ''
      config.theme.now = this.theme === 'dark' ? config.theme.before : 'dark'
      config.theme.before = currentTheme
      this.flushBodyTheme()
    },

    flushBodyTheme() {
      document.body.setAttribute('arco-theme', this.theme)
    }
  }
})

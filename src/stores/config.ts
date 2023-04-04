import { defineStore } from 'pinia'
import { useLocalStorage, toReactive } from '@vueuse/core'
import { useRouter } from 'vue-router'

const config = toReactive(
  useLocalStorage('APP_CONFIG', {
    theme: { now: 'dark', before: '' }
  })
)

const recentList = useLocalStorage<Editor.RecentRecord[]>('RECENT_PROJECT', [])

export const useConfigStore = defineStore('configStore', {
  state: () => ({
    project: {} as Editor.Project
  }),

  getters: {
    theme() {
      return config.theme.now
    },

    isDarkMode() {
      return config.theme.now === 'dark'
    },

    recentList() {
      return recentList.value
    },

    isProjectLoaded(state) {
      return !!state.project.path
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
    },

    addRecentProject(project: Editor.RecentRecord) {
      recentList.value.unshift(project)
    },

    setCurrentProject(project: Editor.Project) {
      this.project = project
    },

    clearProject() {
      this.project = {} as Editor.Project
    }
  }
})

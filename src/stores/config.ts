import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { watch } from 'vue'

const config = useLocalStorage('APP_CONFIG', {
  theme: { now: 'dark', before: '' }
})

const recentList = useLocalStorage<Editor.RecentRecord[]>('RECENT_PROJECT', [])

export const useConfigStore = defineStore('configStore', {
  state: () => ({
    project: {} as Editor.Project
  }),

  getters: {
    theme() {
      return config.value.theme.now
    },

    isDarkMode() {
      return config.value.theme.now === 'dark'
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
      config.value.theme.now =
        this.theme === 'dark' ? config.value.theme.before : 'dark'
      config.value.theme.before = currentTheme
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

watch(
  () => config.value.theme.now,
  () => {
    const configStore = useConfigStore()
    configStore.flushBodyTheme()
  }
)

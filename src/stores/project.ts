import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useProjectStore = defineStore('ProjectStore', {
  state: () => {
    const project = useLocalStorage('CURRENT_PROJECT', {} as Editor.Project)
    const recentList = useLocalStorage(
      'RECENT_PROJECT',
      [] as Editor.RecentRecord[]
    )
    return { project, recentList }
  },

  getters: {
    isProjectLoaded(state) {
      return !!state.project.path
    }
  },

  actions: {
    /**
     * 添加项目到最近打开的项目列表
     * @param project
     */
    addRecentProject(project: Editor.RecentRecord) {
      const index = this.recentList.findIndex(
        (item) => item.path === project.path
      )
      if (~index) this.recentList.splice(index, 1)
      this.recentList.unshift(project)
    },
    /**
     * 设置当前项目
     * @param project
     */
    setCurrentProject(project: Editor.Project) {
      this.project = project
    },
    /**
     * 清除当前项目
     */
    clearProject() {
      this.project = {} as Editor.Project
    }
  }
})

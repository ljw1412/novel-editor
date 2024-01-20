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
    getProjectPath() {
      return this.project.path
    },

    getLocalUrl(path: string, addUnix = true) {
      if (!path) return ''
      if (path.startsWith('http')) return path
      const prjDir = this.getProjectPath()
      if (!prjDir) return path
      if (!path.startsWith('\\') && !prjDir.endsWith('\\')) path = '\\' + path
      const suffix = addUnix ? `?${+new Date()}` : ''
      return `novel-editor:///${prjDir}${path}${suffix}`.replace(/\\/g, '/')
    },
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

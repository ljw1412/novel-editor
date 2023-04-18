import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { RouteLocationNamedRaw } from 'vue-router'
import { useEditorStore, useProjectStore } from './index'

type RouteCache = Record<Editor.ActivityActions, RouteLocationNamedRaw | null>

function createRouteCache(): RouteCache {
  return {
    bookshelf: null,
    world: null,
    character: null,
    info: null
  }
}

export const useCacheStore = defineStore('cacheStore', {
  state: () => {
    const routeCache = createRouteCache()

    return {
      routeCache
    }
  },

  getters: {},

  actions: {
    initRouteCache(projectId?: string) {
      if (!projectId) projectId = useProjectStore().project.id
      if (!projectId) return
      // @ts-ignore
      this.$patch({
        routeCache: useLocalStorage(`PROJECT_${projectId}`, createRouteCache())
      })
    }
  }
})

import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { RouteLocationNamedRaw } from 'vue-router'
import { useProjectStore } from './index'
import * as logger from '/@/utils/logger'

type RouteCache = Record<Editor.Activity.Types, RouteLocationNamedRaw | null>

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
    },

    setRouteCache(
      action: Editor.Activity.Types,
      route: RouteLocationNamedRaw | null
    ) {
      this.routeCache[action] = route
    },

    removeRouteCache(projectId: string) {
      if (!projectId) return
      this.$patch({ routeCache: createRouteCache() })
      const key = `PROJECT_${projectId}`
      localStorage.removeItem(key)
      logger.success('移除路由缓存', key)
    }
  }
})

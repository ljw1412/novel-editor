<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ipcOff, ipcOn } from '/@/utils/ipc'
import AppHeaderMini from './components/AppHeaderMini.vue'

const $route = useRoute()
const $router = useRouter()

const title = ref('')
const favicon = ref('')
const isLoading = ref(false)

if ($route.meta.isWebView) {
  const listener: IpcListener = (e, action, data = {}) => {
    if (action === 'url') $router.push({ query: data })
    if (action === 'loading') isLoading.value = data.loading
    if (action === 'title') title.value = data.title
    if (action === 'favicons') {
      const { favicons } = data
      if (favicons) {
        const icon = favicons.find((item: string) => item.includes('.svg'))
        favicon.value = icon || favicons[0]
      }
    }
  }

  ipcOn('page-updated', listener)
  onBeforeUnmount(() => {
    ipcOff('page-updated', listener)
  })
}
</script>

<template>
  <AppHeaderMini
    :title="title"
    :icon="isLoading ? 'icon-loading' : favicon"
    class="flex-shrink-0"
  ></AppHeaderMini>
  <main id="app-separate" class="app-separate">
    <RouterView v-if="!$route.meta.isWebView"></RouterView>
  </main>
</template>

<style lang="scss"></style>

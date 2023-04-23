<script setup lang="ts" name="EditorSetting">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useStore from '/@/stores'
import $API from '/@/apis'

const $route = useRoute()
const $router = useRouter()
const { cacheStore } = useStore()
const config = ref({})

const paneList = [
  { key: 'SettingRegular', title: '常规' },
  { key: 'SettingInterface', title: '界面' },
  { key: 'SettingAbout', title: '关于' }
]

const tabKey = computed({
  get: () => ($route.name as string) || '',
  set(key: string) {
    $router.replace({ name: key })
  }
})

if ($route.name === 'EditorSetting') {
  let tab = $route.query.tab as string
  if (!tab || paneList.map((t) => t.key).includes(tab)) {
    tab = paneList[0].key
  }
  tabKey.value = tab
}

;(async () => {
  config.value = await $API.Electron.config.getConfig()
})()

function handleTabChange(key: any) {
  cacheStore.setRouteCache('setting', { name: key })
}
</script>

<template>
  <div class="editor-setting h-full flex flex-col px-4 py-2">
    <a-tabs
      v-model:active-key="tabKey"
      hide-content
      class="flex-shrink-0"
      @change="handleTabChange"
    >
      <a-tab-pane
        v-for="pane of paneList"
        :key="pane.key"
        :title="pane.title"
      ></a-tab-pane>
    </a-tabs>

    <a-scrollbar
      outer-class="flex-grow h-0 w-full"
      class="content h-full w-full py-4 px-5 overflow-y-auto"
    >
      <router-view :config="config"></router-view>
    </a-scrollbar>
  </div>
</template>

<style lang="scss">
.editor-setting {
}
</style>

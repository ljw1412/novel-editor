<script setup lang="ts" name="AppSetting">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import $API from '/@/apis'

const $route = useRoute()
const $router = useRouter()

const tabList = [
  { title: '常规', name: 'AppSettingRegular' },
  { title: '界面', name: 'AppSettingInterface' }
]
let toTab = $route.query.tab as string
const tabKey = computed({
  get: () => ($route.name as string) || '',
  set(key: string) {
    $router.replace({ name: key })
  }
})

if (!toTab || tabList.map((t) => t.name).includes(toTab)) {
  toTab = tabList[0].name
}
if ($route.name === 'AppSetting') {
  $router.replace({ name: toTab })
}
</script>

<template>
  <div class="app-setting flex h-full select-none">
    <div class="app-drag absolute top-0 left-0 w-full h-7"></div>
    <AppCloseBtn fixed size="large"></AppCloseBtn>
    <aside class="w-[160px] h-full px-3 app-drag">
      <h4 class="mt-4 mb-4 ml-2 leading-1">设置</h4>
      <a-radio-group v-model="tabKey" size="mini" class="w-full app-no-drag">
        <a-radio
          v-for="tab of tabList"
          :key="tab.name"
          :value="tab.name"
          class="mx-0 mb-2 p-0 w-full"
        >
          <template #radio="{ checked }">
            <a-tag
              :color="
                checked ? 'rgba(var(--app-color-common-rgb),0.5)' : undefined
              "
              :checked="checked"
              checkable
              size="large"
              class="w-full pl-3"
            >
              {{ tab.title }}
            </a-tag>
          </template>
        </a-radio>
      </a-radio-group>
    </aside>

    <main class="setting-content h-full flex-grow">
      <h5 class="h-[40px] mb-2 pt-[22px] px-3 leading-1">
        {{ $route.meta.title }}
      </h5>
      <a-scrollbar outer-class="h-full w-full" class="h-full overflow-auto p-3">
        <router-view></router-view>
      </a-scrollbar>
    </main>
  </div>
</template>

<style lang="scss">
.app-setting {
  border: 1px solid rgba(var(--app-theme-rgb), var(--app-border-opacity));
  aside {
    background-color: var(--app-sidebar-bg);
  }
}
</style>

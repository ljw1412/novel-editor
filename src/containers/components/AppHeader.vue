<script setup lang="ts">
import { computed, reactive, ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppControls from './AppControls.vue'
import { useConfigStore, useEditorStore, useProjectStore } from '/@/stores'
import $API from '/@/apis'

const $route = useRoute()
const $router = useRouter()
const configStore = useConfigStore()
const projectStore = useProjectStore()
const editorStore = useEditorStore()

const title = computed(() => {
  const routeTitle = $route.meta.title || ''
  const projectTitle = projectStore.project.title || ''
  const appTitle = import.meta.env.VITE_APP_TITLE
  return [routeTitle, projectTitle, appTitle].filter((i) => i).join(' - ')
})

interface AppHeaderMenuItem {
  group: string
  active: boolean
  children: {
    label: string
    isHide?: boolean | ComputedRef<boolean>
    disabled?: any
    fn: () => void
  }[]
}

const menu = reactive<AppHeaderMenuItem[]>([
  {
    group: '文件',
    active: false,
    children: [
      {
        label: '设置',
        fn: () => {
          $API.Electron.win.openPresetWindow('设置')
        }
      },
      {
        label: '关闭项目',
        isHide: computed(
          () => !projectStore.isProjectLoaded && $route.name !== 'AppEditor'
        ),
        disabled: computed(
          () => !projectStore.isProjectLoaded && $route.name !== 'AppEditor'
        ),
        fn: () => {
          projectStore.clearProject()
          editorStore.$reset()
          $router.push({ name: 'HomeWelcome' })
        }
      }
    ]
  },
  // { group: '编辑', children: [] },
  {
    group: '帮助',
    active: false,
    children: [
      {
        label: '切换开发者工具',
        fn: () => {
          $API.Electron.win.control('toggleDevTools')
        }
      },
      {
        label: '关于',
        fn: () => {}
      }
    ]
  }
])

function handleMenuSelect(value?: string | number | Record<string, any>) {
  if (typeof value === 'object' && value.fn) {
    value.fn()
  }
}
</script>

<template>
  <header id="app-header" class="app-header app-drag layout-lr">
    <div class="header-left flex items-center">
      <div class="inline-flex items-center px-2">
        <icon-pen-fill size="22" />
      </div>
      <a-space size="mini" class="ml-1">
        <a-dropdown
          v-for="item of menu"
          position="bl"
          content-class="app-header-popmenu"
          v-model:popup-visible="item.active"
          :render-to-body="false"
          @select="handleMenuSelect"
        >
          <div
            class="text-btn inline-block app-no-drag px-3 py-[2px] rounded-md text-md"
            :class="{ active: item.active }"
          >
            {{ item.group }}
          </div>
          <template #content>
            <a-doption
              v-for="child of item.children"
              v-show="!child.isHide"
              :value="child"
              :disabled="child.disabled"
            >
              {{ child.label }}
            </a-doption>
          </template>
        </a-dropdown>
      </a-space>
    </div>
    <div class="header-center layout-center-p">{{ title }}</div>
    <div class="layout-lr h-full">
      <div class="actions mr-2">
        <div
          class="action-btn text-btn app-no-drag layout-center rounded-md cursor-pointer"
          type="text"
          @click="configStore.toggleDarkMode"
        >
          <component
            :is="configStore.isDarkMode ? 'icon-moon-fill' : 'icon-sun'"
          />
        </div>
      </div>
      <AppControls who="main"></AppControls>
    </div>
  </header>
</template>

<style lang="scss">
#app-header {
  position: relative;
  height: var(--app-header-height);
  color: #eeeeee;
  background-color: var(--app-theme);
  transition: color 0.15s ease-out, background-color 0.2s ease-out;
  will-change: color, background-color;
  z-index: var(--app-header-z-index);
  opacity: var(--app-header-opacity);
  user-select: none;
  z-index: 2000;

  .actions {
    .action-btn {
      width: 32px;
      height: 32px;
      font-size: 16px;
    }
  }
}

.app-header-popmenu {
  .arco-dropdown {
    padding: 4px;
    border: none;
    min-width: 120px;
  }
}
</style>

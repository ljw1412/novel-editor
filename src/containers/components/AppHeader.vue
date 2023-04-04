<script setup lang="ts">
import { computed, ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppControls from './AppControls.vue'
import { useConfigStore } from '/@/stores/config'

defineProps({ who: { type: String, default: 'child' } })
const $route = useRoute()
const $router = useRouter()
const configStore = useConfigStore()

const title = computed(() => {
  const routeTitle = $route.meta.title || ''
  const projectTitle = configStore.project.title || ''
  const appTitle = import.meta.env.VITE_APP_TITLE
  return [routeTitle, projectTitle, appTitle].filter((i) => i).join(' - ')
})

interface AppHeaderMenuItem {
  group: string
  children: {
    label: string
    disabled?: any
    fn: () => void
  }[]
}

const menu: AppHeaderMenuItem[] = [
  {
    group: '文件',
    children: [
      {
        label: '关闭项目',
        disabled: computed(() => configStore.isProjectLoaded),
        fn: () => {
          configStore.clearProject()
          $router.push({ name: 'AppHomeWelcome' })
        }
      }
    ]
  },
  // { group: '编辑', children: [] },
  {
    group: '帮助',
    children: [
      {
        label: '关于',
        fn: () => {}
      }
    ]
  }
]

function handleMenuSelect(value?: string | number | Record<string, any>) {
  console.log(value)
  if (typeof value === 'object' && value.fn) {
    value.fn()
  }
}
</script>

<template>
  <header id="app-header" class="app-header app-drag layout-lr">
    <div class="header-left flex align-center">
      <a-space size="mini" class="ml-1">
        <a-dropdown
          v-for="item of menu"
          position="bl"
          content-class="app-header-popmenu"
          @select="handleMenuSelect"
        >
          <div class="menu-item inline-block app-no-drag px-3 py-1">
            {{ item.group }}
          </div>
          <template #content>
            <a-doption
              v-for="child of item.children"
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
    <div class="header-right layout-lr">
      <div class="actions mr-2">
        <div
          class="action-btn app-no-drag layout-center rounded-md"
          type="text"
          @click="configStore.toggleDarkMode"
        >
          <component
            :is="configStore.isDarkMode ? 'icon-moon-fill' : 'icon-sun'"
          />
        </div>
      </div>
      <AppControls :who="who"></AppControls>
    </div>
  </header>
</template>

<style lang="scss">
#app-header {
  position: relative;
  height: var(--app-header-height);
  color: #cccccc;
  background-color: var(--app-theme);
  transition: color 0.15s ease-out, background-color 0.2s ease-out;
  will-change: color, background-color;
  z-index: var(--app-header-z-index);
  opacity: var(--app-header-opacity);
  user-select: none;

  .header-left {
    // height: 100%;

    .menu-item {
      &:hover {
        border-radius: 4px;
        background-color: var(--color-fill-4);
      }
    }
  }

  .header-right {
    height: 100%;
  }

  .actions {
    .action-btn {
      cursor: pointer;
      width: 32px;
      height: 32px;
      font-size: 16px;

      &:hover {
        background-color: rgba(255, 255, 255, 0.16);
      }

      &:active {
        background-color: rgba(255, 255, 255, 0.3);
      }
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

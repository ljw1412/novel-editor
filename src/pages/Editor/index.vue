<script setup lang="ts" name="AppEditor">
import { ref, computed, onUnmounted } from 'vue'
import { RouteLocationRaw, useRoute, useRouter } from 'vue-router'
import { useConfigStore, useEditorStore } from '/@/stores'

const configStore = useConfigStore()
const editorStore = useEditorStore()

const $route = useRoute()
const $router = useRouter()

const actions = editorStore.actions
const isCollapsed = ref(configStore.sidebar.isCollapsed || false)
const asideWidth = ref(configStore.sidebar.width || 300)
const currentTab = ref(configStore.sidebar.tab as Editor.SidebarActions)
const isSideResizing = ref(false)
if (!actions.map((i) => i.key).includes(currentTab.value)) {
  currentTab.value = actions[0].key
}
$router.replace(editorStore.getActionRoute(currentTab.value))

const asideWidthComp = computed({
  get() {
    if (isCollapsed.value || asideWidth.value < 0) return 0
    return asideWidth.value
  },
  set(v: number) {
    asideWidth.value = v
  }
})

function resizeMovingStart() {
  isSideResizing.value = true
}

function resizeMoving({ width }: { width: number }) {
  if (width < 100) {
    isCollapsed.value = true
    // asideWidth.value = 56
  }
  if (width >= 100 && width < 256) {
    isCollapsed.value = false
    asideWidthComp.value = 256
  }
}

function resizeMovingEnd() {
  isSideResizing.value = false
  updateState()
}

function handleActionItemClick(item: {
  key: Editor.SidebarActions
  route: RouteLocationRaw
}) {
  if (currentTab.value === item.key) {
    isCollapsed.value = !isCollapsed.value
  } else {
    currentTab.value = item.key
    isCollapsed.value = false
    $router.replace(editorStore.getActionRoute(item.key))
  }
  updateState()
}

function updateState() {
  configStore.sidebar.isCollapsed = isCollapsed.value
  configStore.sidebar.width = asideWidthComp.value
  configStore.sidebar.tab = currentTab.value
}

editorStore.loadWorldData()
editorStore.loadCharacterData()

onUnmounted(updateState)
window.addEventListener('unload', updateState)
</script>

<template>
  <div class="app-editor flex">
    <!-- 活动栏 -->
    <div class="activitybar w-[56px] h-full flex-shrink-0">
      <a-tooltip
        v-for="item of actions"
        :key="item.label"
        :content="item.label"
        content-class="select-none"
        position="right"
        mini
      >
        <div
          class="action-item relative layout-center w-[56px] h-[56px] cursor-pointer opacity-50 hover:opacity-100"
          :class="{ active: !isCollapsed && item.key === currentTab }"
          @click="handleActionItemClick(item)"
        >
          <component v-if="item.icon" :is="item.icon" :size="32"></component>
        </div>
      </a-tooltip>
    </div>
    <!-- 侧边栏 -->
    <a-resize-box
      component="aside"
      class="aside-resize-box max-w-[500px] flex-shrink-0 h-full select-none"
      :class="{ resizing: isSideResizing }"
      :style="{ minWidth: isCollapsed ? '0' : '256px' }"
      v-model:width="asideWidthComp"
      @moving-start="resizeMovingStart"
      @moving="resizeMoving"
      @moving-end="resizeMovingEnd"
    >
      <template #resize-trigger="{ direction }">
        <div class="aside-resize-line h-full w-[2px] bg-color-common"></div>
      </template>
      <router-view
        v-show="!isCollapsed"
        name="sidebar"
        v-slot="{ Component, route }"
      >
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </a-resize-box>
    <!-- 主体 -->
    <main class="editor-content relative h-full flex-grow">
      <router-view></router-view>
    </main>
  </div>
</template>

<style lang="scss">
.app-editor {
  background-color: var(--editor-bg);

  .activitybar {
    background-color: var(--editor-activitybar-bg);
    border-right: 1px solid var(--color-border-2);

    .action-item {
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 3px;
        height: 100%;
        background-color: var(--app-color-common);
        opacity: 0;
      }

      &.active {
        opacity: 1 !important;
        color: var(--app-color-common);

        &::before {
          opacity: 1;
        }
      }

      &:active::before {
        opacity: 0.5;
      }
    }
  }

  .aside-resize-box {
    .arco-resizebox-trigger {
      padding: 0 1px;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 1;

      &:hover,
      &:active {
        opacity: 1;
      }
    }

    &.resizing .arco-resizebox-trigger {
      opacity: 1;
    }
  }

  .editor-content {
    input::placeholder,
    textarea::placeholder {
      opacity: 0.7;
      font-weight: 400;
    }

    .arco-timeline-item-dot-line {
      border-color: currentColor;
      opacity: 0.3;
    }
  }
}

body:not([arco-theme='dark']) {
  .app-editor {
    .editor-content {
      --color-fill-1: rgba(255, 255, 255, 0.3);
      --color-fill-2: rgba(255, 255, 255, 0.4);
      --color-fill-3: rgba(255, 255, 255, 0.6);
      --color-fill-4: rgba(255, 255, 255, 0.7);
    }
  }
}
</style>

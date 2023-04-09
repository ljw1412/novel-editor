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
    if (isCollapsed.value || asideWidth.value < 56) return 56
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

onUnmounted(updateState)
window.addEventListener('unload', updateState)
</script>

<template>
  <div class="app-editor flex">
    <!-- 侧边栏 -->
    <a-resize-box
      component="aside"
      class="aside-resize-box max-w-[600px] flex-shrink-0 h-full select-none"
      :class="{ resizing: isSideResizing }"
      :style="{ minWidth: isCollapsed ? '56px' : '256px' }"
      v-model:width="asideWidthComp"
      @moving-start="resizeMovingStart"
      @moving="resizeMoving"
      @moving-end="resizeMovingEnd"
    >
      <template #resize-trigger="{ direction }">
        <div class="aside-resize-line h-full w-[2px] bg-color-common"></div>
      </template>
      <section class="sidebar flex h-full flex-shrink-0 shadow-xl">
        <section class="actions w-[56px] h-full flex-shrink-0">
          <a-tooltip
            v-for="item of actions"
            :key="item.label"
            :content="item.label"
            position="right"
            mini
          >
            <div
              class="action-item relative layout-center w-[56px] h-[56px] cursor-pointer opacity-50 hover:opacity-100"
              :class="{ active: !isCollapsed && item.key === currentTab }"
              @click="handleActionItemClick(item)"
            >
              <component
                v-if="item.icon"
                :is="item.icon"
                :size="32"
              ></component>
            </div>
          </a-tooltip>
        </section>
        <section
          v-show="!isCollapsed"
          class="part flex flex-col min-w-[200px] h-full flex-grow"
        >
          <section
            class="part-title layout-lr h-[40px] px-3 shadow-sm flex-shrink-0"
          >
            <section>{{ $route.meta.title }}</section>
          </section>
          <div class="part-content flex-grow h-0">
            <router-view name="sidebar" v-slot="{ Component, route }">
              <keep-alive>
                <component :is="Component" :key="route.name" />
              </keep-alive>
            </router-view>
          </div>
        </section>
      </section>
    </a-resize-box>
    <!-- 主体 -->
    <main class="editor-content relative h-full flex-grow overflow-y-auto">
      <router-view></router-view>
    </main>
  </div>
</template>

<style lang="scss">
.app-editor {
  background-color: var(--editor-bg);

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

  .sidebar {
    background-color: var(--editor-sidebar-bg);

    .actions {
      border-right: 1px solid var(--color-border-2);
      background-color: var(--editor-sidebar-actions-bg);
    }

    .part {
    }

    .arco-collapse {
      border-radius: initial;
    }

    .arco-collapse-item {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      border-bottom: none;

      &.arco-collapse-item-active {
        height: 0;
        flex-grow: 1;
      }

      .arco-collapse-item-header {
        padding-top: 4px;
        padding-bottom: 4px;
        padding-right: 4px;
        min-height: 34px;
        background-color: var(--color-bg-4);

        &:focus {
          outline: 1px solid var(--app-color-common);
          outline-offset: -1px;
        }
      }

      .arco-collapse-item-content {
        background-color: initial;
        padding: 0;

        .arco-collapse-item-content-box {
          padding: 0;
          height: 100%;
        }
        &.arco-collapse-item-content-expend {
          height: 100% !important;
        }
      }

      .page-item {
        &:focus {
          outline: 1px solid var(--app-color-common);
          outline-offset: -1px;
        }
      }

      &:hover {
        .editor-page-item {
          .children::before {
            opacity: 0.15;
          }
        }
      }
    }
  }

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
      opacity: 1;
      color: var(--app-color-common);

      &::before {
        opacity: 1;
      }
    }

    &:active::before {
      opacity: 0.5;
    }
  }

  .part-title {
    border-bottom: 1px solid var(--color-border);
  }
}
</style>

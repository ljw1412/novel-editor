<script setup lang="ts" name="AppEditor">
import { ref, computed } from 'vue'
import EditorInfo from './components/Info.vue'

const isCollapsed = ref(false)
const isSideResizing = ref(false)
const asideWidth = ref(300)
const currentTab = ref('章节')

const asideWidthComp = computed({
  get() {
    return isCollapsed.value ? 56 : asideWidth.value
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
    asideWidth.value = 256
  }
}

function resizeMovingEnd() {
  isSideResizing.value = false
}

const actions = [
  { label: '章节', icon: 'icon-bookmark', component: null },
  { label: '世界观', icon: 'icon-common', component: null },
  { label: '人物', icon: 'icon-user-group', component: null },
  { label: '基础信息', icon: 'icon-info-circle', component: EditorInfo }
]

function handleActionItemClick(item: { label: string }) {
  if (currentTab.value === item.label) {
    isCollapsed.value = !isCollapsed.value
  } else {
    currentTab.value = item.label
    isCollapsed.value = false
  }
}
</script>

<template>
  <div class="app-editor flex">
    <!-- 侧边栏 -->
    <a-resize-box
      component="aside"
      class="aside-resize-box max-w-[600px] select-none"
      :class="{ resizing: isSideResizing }"
      :style="{ minWidth: isCollapsed ? '56px' : '256px' }"
      v-model:width="asideWidthComp"
      @moving-start="resizeMovingStart"
      @moving="resizeMoving"
      @moving-end="resizeMovingEnd"
    >
      <template #resize-trigger="{ direction }">
        <div class="aside-resize-line h-full w-[3px] bg-color-common"></div>
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
              :class="{ active: !isCollapsed && item.label === currentTab }"
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
          v-if="!isCollapsed"
          class="part min-w-[200px] h-full flex-grow"
        >
          <section class="part-title h-[40px] layout-lr px-3 shadow-sm">
            <section>{{ currentTab }}</section>
          </section>
          <component
            v-for="item of actions"
            v-show="item.label === currentTab"
            :key="'pane-' + item.label"
            :is="item.component"
          ></component>
        </section>
      </section>
    </a-resize-box>
    <!-- 主体 -->
    <main class="editor h-full flex-grow overflow-auto"></main>
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
      background-color: var(--editor-sidebar-actions-bg);
    }

    .part {
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

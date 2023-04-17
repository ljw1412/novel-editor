<script setup lang="ts" name="AppEditor">
import { ref, computed, onUnmounted } from 'vue'
import { RouteLocationRaw, useRoute, useRouter } from 'vue-router'
import { useConfigStore, useDialogStore, useEditorStore } from '/@/stores'
import ImageCropperDialog from '/@/components/ImageCropperDialog.vue'
import Activitybar from './components/Activitybar.vue'

const configStore = useConfigStore()
const editorStore = useEditorStore()
const dialogStore = useDialogStore()

const isCollapsed = computed({
  get: () => configStore.sidebar.isCollapsed,
  set: (v) => (configStore.sidebar.isCollapsed = v)
})

const asideWidth = ref(configStore.sidebar.width || 300)
const isSideResizing = ref(false)

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
  }
  if (width >= 100 && width < 256) {
    isCollapsed.value = false
    asideWidthComp.value = 256
  }
}

function resizeMovingEnd() {
  isSideResizing.value = false
  configStore.sidebar.width = asideWidthComp.value
}

editorStore.loadWorldData()
editorStore.loadCharacterData()
</script>

<template>
  <div class="app-editor flex">
    <!-- 活动栏 -->
    <Activitybar></Activitybar>
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
    <main
      class="editor-content relative h-full max-w-[1200px] mx-auto flex-grow overflow-hidden"
    >
      <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="route.fullPath" />
      </router-view>
    </main>
    <!-- 全局弹窗 -->
    <ImageCropperDialog
      v-model:visiable="dialogStore.cropper.isDisplay"
      :image="dialogStore.cropper.image"
      v-bind="dialogStore.cropperOptions"
      @success="dialogStore.cropper.callback"
    >
    </ImageCropperDialog>
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

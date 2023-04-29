<script setup lang="ts">
import ContextView from '/@/components/ContextView.vue'
import { useConfigStore } from './stores'

const configStore = useConfigStore()
configStore.loadAppConfig()
</script>

<template>
  <router-view></router-view>
  <ContextView></ContextView>
</template>

<style lang="scss">
body {
  color: var(--app-color-text);
  background-color: var(--app-color-bg);
  transition: color 0.2s ease-out, background-color 0.3s ease-out;
  will-change: color, background-color;
}

#app {
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .novel-editor {
    --editor-color: var(--color-text-1);
    --keyword-color: var(--app-color-common);
    --block-bg: var(--color-fill-2);
    --block-bg-hover: var(--color-fill-3);
    --block-bg-focus: var(--color-bg-2);
  }
}

#app-main,
#app-separate {
  flex: 1 0 auto;
  height: calc(100% - var(--app-header-height));
  border: 1px solid rgba(var(--app-theme-rgb), var(--app-border-opacity));
  border-top: none;
  transition: border-color 0.2s ease-out;

  > * {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
</style>

<script setup lang="ts">
import AppControls from './AppControls.vue'
import { useConfigStore } from '/@/stores/config'

defineProps({ who: { type: String, default: 'child' } })
const configStore = useConfigStore()
</script>

<template>
  <header id="app-header" class="app-header app-drag layout-lr">
    <div class="header-left"></div>
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
  color: #ffffff;
  background-color: var(--app-theme);
  transition: color 0.15s ease-out, background-color 0.2s ease-out;
  will-change: color, background-color;
  z-index: var(--app-header-z-index);

  .header-left {
    height: 100%;
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
</style>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '/@/stores'
import AppControls from './AppControls.vue'
import AppFavicon from './AppFavicon.vue'
import { safeBoolean } from '/@/utils/assist'

const props = defineProps({ title: String, icon: String })
const $route = useRoute()
const hideIcon = safeBoolean($route.meta.hideIcon as boolean)
const $router = useRouter()
const configStore = useConfigStore()

const mTitle = computed(() => {
  return props.title || $route.meta.title || ''
})
</script>

<template>
  <header id="app-header-mini" class="app-header-mini app-drag layout-lr">
    <div class="header-left flex align-center">
      <div class="pl-3 flex items-center leading-none">
        <AppFavicon
          v-if="!hideIcon"
          :icon="icon"
          :size="18"
          class="flex-shrink-0 mr-2"
        ></AppFavicon>
        <div>{{ mTitle }}</div>
      </div>
    </div>

    <div class="layout-lr h-full">
      <!-- <div class="actions mr-2">
        <div
          class="action-btn text-btn app-no-drag layout-center rounded-md cursor-pointer"
          type="text"
          @click="configStore.toggleDarkMode"
        >
          <component
            :is="configStore.isDarkMode ? 'icon-moon-fill' : 'icon-sun'"
            :size="16"
          />
        </div>
      </div> -->
      <AppControls></AppControls>
    </div>
  </header>
</template>

<style lang="scss">
#app-header-mini {
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
    }
  }
}
</style>

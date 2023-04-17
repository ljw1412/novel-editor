<script setup lang="ts" name="AppHome">
import { useProjectStore } from '/@/stores'

const APP_TITLE = import.meta.env.VITE_APP_TITLE
const APP_BELONG_TO = import.meta.env.VITE_APP_BELONG_TO

const projectStore = useProjectStore()

if (projectStore.isProjectLoaded) {
  projectStore.clearProject()
}
</script>

<template>
  <div class="app-home flex text-color-2 select-none">
    <div class="flex flex-col max-w-[1200px] w-3/4 h-[600px] m-auto">
      <div
        class="app-home__header flex flex-col justify-center px-7 flex-shrink-0 rounded-lg overflow-hidden"
        :class="$route.name !== 'HomeWelcome' ? 'h-[120px]' : 'h-[240px]'"
      >
        <h3 class="">{{ APP_TITLE }}</h3>
        <p class="text-color-3 text-xl mt-2">{{ APP_BELONG_TO }}荣誉出品</p>
      </div>

      <div class="app-home__content relative flex-grow mt-2">
        <router-view v-slot="{ Component }">
          <transition name="bottom-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.app-home {
  &__header {
    background-color: rgb(var(--primary-6), 0.01);
    text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.25);
    transition: height 0.4s;
  }

  &__content {
    .arco-page-header-wrapper {
      padding: 0;
    }

    > [class*='-enter-active'],
    > [class*='-leave-active'] {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      background-color: var(--app-color-bg);
    }
    > [class*='-enter-active'] {
      z-index: 1;
    }
    > [class*='-leave-active'] {
      z-index: 0;
    }
  }
}
</style>

<script setup lang="ts" name="AppHome">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useEventListener } from '@vueuse/core'
import { useProjectStore } from '/@/stores'
import { getPublicUrl } from '/@/utils/url'

const APP_TITLE = import.meta.env.VITE_APP_TITLE
const APP_BELONG_TO = import.meta.env.VITE_APP_BELONG_TO

const $route = useRoute()
const projectStore = useProjectStore()

if (projectStore.isProjectLoaded) {
  projectStore.clearProject()
}

const bgCount = 23
const bannerBg = getPublicUrl(
  `/images/banner-${parseInt(Math.random() * bgCount + '') + 1}.png`
)

const headerHeight = ref(240)
const safeHeaderHeight = computed(() => {
  if ($route.name !== 'HomeWelcome') return 120
  return headerHeight.value
})

useEventListener('wheel', (e) => {
  if ($route.name !== 'HomeWelcome') return
  const base = e.deltaY < 0 ? 1 : -1
  const nextHeight = headerHeight.value + 30 * base
  headerHeight.value = Math.max(Math.min(nextHeight, 360), 120)
})
</script>

<template>
  <div class="app-home flex text-color-2 select-none">
    <div class="flex flex-col max-w-[1200px] w-3/4 h-[600px] m-auto">
      <div
        class="app-home__header flex flex-col justify-center px-7 flex-shrink-0 rounded-lg overflow-hidden text-white min-h-[120px]"
        :class="{ 'is-welcome': $route.name === 'HomeWelcome' }"
        :style="{
          backgroundImage: `url(${bannerBg})`,
          height: `${safeHeaderHeight}.px`
        }"
      >
        <h3>{{ APP_TITLE }}</h3>
        <p class="text-gray-100 text-xl mt-2">{{ APP_BELONG_TO }}荣誉出品</p>
        <span class="text-gray-200 ai-bg-tips">Created by AI</span>
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
    position: relative;
    background-color: rgb(var(--primary-6), 0.01);
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.75);
    transition: height 0.4s 0.3s;

    &.is-welcome {
      transition: height 0.2s;
    }

    .ai-bg-tips {
      position: absolute;
      right: 20px;
      bottom: 10px;
      font-size: 12px;
    }
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

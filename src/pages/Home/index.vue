<script setup lang="ts" name="AppHome">
const APP_TITLE = import.meta.env.VITE_APP_TITLE
const APP_BELONG_TO = import.meta.env.VITE_APP_BELONG_TO
</script>

<template>
  <div class="app-home flex">
    <div class="flex flex-col max-w-[1200px] w-3/4 h-[600px] m-auto">
      <div class="app-home__header flex-shrink-0">
        <h1 class="inline-block">{{ APP_TITLE }}</h1>
        <p class="inline-block text-color-3 text-[24px] ml-3">
          {{ APP_BELONG_TO }}荣誉出品
        </p>
      </div>

      <div class="app-home__content relative flex-grow">
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
  user-select: none;
  color: var(--color-text-2);

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
    }
  }
}
</style>

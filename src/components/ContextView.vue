<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useContextViewStore } from '/@/stores'

const contextView = useContextViewStore()
const { isDisplay, menuList, callback, positionStyles } =
  storeToRefs(contextView)

function handleOutsideClick() {
  if (isDisplay.value) {
    isDisplay.value = false
    callback.value(null)
  }
}

function handleMenuItemClick(item: CtxMenu.Item) {
  setTimeout(() => {
    isDisplay.value = false
    callback.value(item)
  }, 0)
}
</script>

<template>
  <div
    v-show="isDisplay"
    ref="contextViewEl"
    class="context-view rounded-md overflow-hidden shadow-md"
    :style="positionStyles"
  >
    <div
      class="context-view-block fixed left-0 top-0 w-full h-full"
      style="cursor: initial; z-index: -1"
      @mousedown.stop="handleOutsideClick"
    ></div>
    <div
      v-for="item of menuList"
      :key="item.value"
      class="menu-item flex items-center px-1 cursor-pointer rounded-md"
      @mouseup.right.stop="handleMenuItemClick(item)"
      @click="handleMenuItemClick(item)"
    >
      <div
        class="w-[24px] h-[24px] layout-center flex-shrink-0"
        :style="{ color: item.iconColor }"
      >
        <component v-if="item.icon" :is="item.icon" :size="18" />
      </div>
      <span class="ml-1 flex-shrink-0">{{ item.label }}</span>
    </div>
  </div>
</template>

<style lang="scss">
.context-view {
  position: absolute;
  min-width: 140px;
  padding: 4px;
  background-color: var(--color-bg-5);
  z-index: 3000;
  .menu-item {
    height: 30px;
    line-height: 30px;

    &:hover {
      background-color: rgba(var(--app-color-common-rgb), 0.3);
    }
  }
}
</style>

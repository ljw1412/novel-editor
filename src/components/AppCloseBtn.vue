<script setup lang="ts" name="AppCloseBtn">
import { computed, PropType } from 'vue'
import { useWinStore } from '/@/stores'
const winStore = useWinStore()

const props = defineProps({
  fixed: { type: [Boolean, String], default: false },
  size: { type: String as PropType<'small' | 'large'>, default: '' }
})

const positionClass = computed(() => {
  if (typeof props.fixed === 'boolean') {
    return props.fixed ? 'fixed top right' : ''
  }

  return {
    fixed: true,
    top: props.fixed.includes('t'),
    right: props.fixed.includes('r'),
    bottom: props.fixed.includes('b'),
    left: props.fixed.includes('l')
  }
})

function close() {
  winStore.close('child')
}
</script>

<template>
  <div
    class="app-close-btn layout-center app-no-drag"
    :class="[size, positionClass]"
    @click="close"
  >
    <icon-close />
  </div>
</template>

<style lang="scss">
.app-close-btn {
  width: 32px;
  height: 32px;
  font-size: 16px;

  &.small {
    width: 24px;
    height: 24px;
    font-size: 14px;
  }

  &.large {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  &:hover {
    background-color: var(--color-danger-light-4);
  }

  &:active {
    background-color: #f95a44;
  }

  &.fixed {
    position: fixed;
    z-index: 2000;
  }

  &.top {
    top: 0;
  }
  &.right {
    right: 0;
  }
  &.bottom {
    bottom: 0;
  }
  &.left {
    left: 0;
  }
}
</style>

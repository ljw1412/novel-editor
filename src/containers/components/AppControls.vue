<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useWinStore } from '/@/stores/win'
import { safeBoolean } from '/@/utils/assist'

const props = defineProps({
  mini: Boolean,
  who: { type: String, default: 'child' }
})
const winStore = useWinStore()
const $route = useRoute()
const minimizable = safeBoolean($route.meta.minimizable as boolean, true)
const maximizable = safeBoolean($route.meta.maximizable as boolean, true)

interface ActionButton {
  action: 'min' | 'max' | 'close'
  name: string
  icon: string
  fn: () => void
}
const btnMin: ActionButton = {
  action: 'min',
  name: '最小化',
  icon: 'icon-minus',
  fn: winStore.minimize
}
const btnMax: ActionButton = {
  action: 'max',
  name: '最大化',
  icon: winStore.maximize ? 'icon-shrink' : 'icon-expand',
  fn: winStore.toggleMaximize
}
const btnClose: ActionButton = {
  action: 'close',
  name: '关闭',
  icon: 'icon-close',
  fn: () => {
    if (props.who === 'main') {
      winStore.beforeClose()
    } else {
      winStore.close(props.who)
    }
  }
}

const btnList = computed(() => {
  const list: ActionButton[] = []
  if (minimizable) list.push(btnMin)
  if (maximizable) list.push(btnMax)
  list.push(btnClose)
  return list
})

function windowAction({ action, fn }: ActionButton) {
  fn && fn()
}
</script>

<template>
  <div class="app-controls app-no-drag layout-lr" :class="{ mini }">
    <div
      v-for="btn of btnList"
      :key="btn.action"
      class="control-btn layout-center"
      :class="`btn-${btn.action}`"
      @click="windowAction(btn)"
    >
      <component :is="btn.icon" />
    </div>
  </div>
</template>

<style lang="scss">
.app-controls {
  --btn-width: 50px;
  height: 100%;

  .control-btn {
    width: var(--btn-width);
    height: 100%;
    font-size: 18px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.16);
      color: #ffffff;
    }

    &:active {
      background-color: rgba(255, 255, 255, 0.3);
    }

    &.btn-close {
      &:hover {
        background-color: var(--color-danger-light-4);
      }

      &:active {
        background-color: #f95a44;
      }
    }
  }
}
</style>

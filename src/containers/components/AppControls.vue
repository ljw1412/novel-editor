<script setup lang="ts">
import { computed } from 'vue'
import { useWinStore } from '/@/stores/win'

const props = defineProps({
  mini: Boolean,
  who: { type: String, default: 'child' }
})
const winStore = useWinStore()

type ActionNames = 'min' | 'max' | 'close' | 'hide'
interface ActionButton {
  action: ActionNames
  name: string
  icon: string
  fn: () => void
}
const btnList = computed(
  () =>
    [
      {
        action: 'min',
        name: '最小化',
        icon: 'icon-minus',
        fn: winStore.minimize
      },
      {
        action: 'max',
        name: '最大化',
        icon: winStore.maximize ? 'icon-shrink' : 'icon-expand',
        fn: winStore.toggleMaximize
      },
      {
        action: 'close',
        name: '关闭',
        icon: 'icon-close',
        fn: props.who === 'main' ? winStore.beforeClose : winStore.close
      }
    ] as ActionButton[]
)

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
<!-- 
<template>
  <div
    class="app-controls app-no-drag d-flex align-items-center"
    :class="{ mini }"
  >
    <slot></slot>
    <div
      v-if="minimizable && minimizableOfMeta"
      class="app-control-btn btn-min"
      @click="windowAction('min')"
    >
      <icon-minus />
    </div>
    <div
      v-if="maximizable && maximizableOfMeta"
      class="app-control-btn btn-max"
      @click="windowAction('max')"
    >
      <component :is="isMaximized ? 'icon-shrink' : 'icon-expand'"></component>
    </div>
    <div class="app-control-btn btn-close" @click="windowAction('close')">
      <icon-close />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ipcOn, ipcOff } from '/@/utils/electron'
import { safeBoolean } from '/@/utils/assist'

export default defineComponent({
  name: 'AppControls',
  props: {
    mini: Boolean,
    mode: { type: String, default: 'child' },
    minimizable: { type: Boolean, default: true },
    maximizable: { type: Boolean, default: true }
  },
  data() {
    return {
      isMaximized: false
    }
  },
  computed: {
    minimizableOfMeta(): boolean {
      return safeBoolean(this.$route.meta.minimizable as boolean, true)
    },
    maximizableOfMeta(): boolean {
      return safeBoolean(this.$route.meta.maximizable as boolean, true)
    },
    hidableOfMeta(): boolean {
      return safeBoolean(this.$route.meta.hidable as boolean)
    }
  },
  created() {
    ipcOn('window.maximize', (e, type, { isMaximized }) => {
      if (type === 'max') {
        this.isMaximized = isMaximized
      }
    })
  },
  beforeUnmount() {
    ipcOff('window.maximize')
  },
  methods: {
    windowAction(action: 'min' | 'max' | 'close' | 'hide') {
      if (action === 'close' && this.hidableOfMeta) {
        action = 'hide'
      }
      if (action === 'close' && this.mode === 'main') {
        this.$API.Electron.win.openAppSystem('退出程序')
      } else {
        this.$API.Electron.win.control(action, this.mode)
      }
    }
  }
})
</script>

<style lang="scss">
.app-controls {
  --btn-size: 40px;
  font-size: 18px;
  line-height: 1;

  &.mini {
    --btn-size: 32px;
  }

  .app-control-btn {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: var(--btn-size);
    height: var(--btn-size);
    flex-shrink: 0;
    color: #d3d3d3;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }

    &:active {
      background-color: rgba(255, 255, 255, 0.16);
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
</style> -->

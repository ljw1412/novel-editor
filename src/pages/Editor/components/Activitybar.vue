<script setup lang="ts">
import { computed } from 'vue'
import { RouteLocationRaw, useRouter } from 'vue-router'
import { useConfigStore, useEditorStore } from '/@/stores'
import * as logger from '/@/utils/logger'

const $router = useRouter()

const configStore = useConfigStore()
const editorStore = useEditorStore()
const actions = editorStore.actions
const activity = computed({
  get: () => configStore.sidebar.activity,
  set: (v) => (configStore.sidebar.activity = v)
})
const isCollapsed = computed({
  get: () => configStore.sidebar.isCollapsed,
  set: (v) => (configStore.sidebar.isCollapsed = v)
})

if (!actions.map((i) => i.key).includes(activity.value)) {
  logger.warning(
    `不合法的activity=${activity.value}`,
    `现已修复为合法值${actions[0].key}`
  )
  activity.value = actions[0].key
}

function handleActionItemClick(item: {
  key: Editor.ActivityActions
  route: RouteLocationRaw
}) {
  if (activity.value === item.key) {
    isCollapsed.value = !isCollapsed.value
  } else {
    activity.value = item.key
    isCollapsed.value = false
    $router.replace(editorStore.getActionRoute(item.key))
  }
}
</script>

<template>
  <div class="activitybar h-full flex-shrink-0 select-none">
    <div
      v-for="item of actions"
      :key="item.key"
      class="action-item relative layout-center flex-col w-[56px] h-[56px] mx-auto my-1 rounded-md cursor-pointer"
      :class="{
        collapsed: isCollapsed,
        active: item.key === activity
      }"
      @click="handleActionItemClick(item)"
    >
      <component
        v-if="item.icon"
        :is="item.icon"
        :size="item.key === activity ? 32 : 28"
        class="action-icon"
      />
      <div
        :class="item.key === activity ? 'h-0 overflow-hidden' : 'h-4 mt-1'"
        class="action-label text-sm"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.activitybar {
  background-color: var(--editor-activitybar-bg);
  border-right: 1px solid var(--color-border);
  width: var(--app-activitybar-width);

  .action-item {
    color: var(--color-text-3);

    &::before {
      content: '';
      position: absolute;
      right: 2px;
      top: 50%;
      width: 4px;
      height: 40%;
      transform: translateY(-50%);
      background-color: var(--app-color-common);
      border-radius: 6px;
      opacity: 0;
    }

    .action-icon {
      transition: font-size 0.2s;
    }

    .action-label {
      transition: height 0.15s;
    }

    &.active {
      opacity: 1;
      color: var(--app-color-common);
      background-color: rgba(123, 123, 123, 0.2);

      &:active::before {
        opacity: 0.5;
      }

      &:not(.collapsed):not(:active)::before {
        opacity: 1;
      }
    }

    &:not(.active):hover {
      color: var(--color-text-1);
      background-color: rgba(123, 123, 123, 0.07);
    }
  }
}
</style>

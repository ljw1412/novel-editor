<script setup lang="ts">
import { computed } from 'vue'
import { RouteLocationRaw, useRouter } from 'vue-router'
import { useConfigStore, useEditorStore } from '/@/stores'

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
  activity.value = actions[0].key
}
$router.replace(editorStore.getActionRoute(activity.value))

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
  <div class="activitybar w-[56px] h-full flex-shrink-0">
    <a-tooltip
      v-for="item of actions"
      :key="item.label"
      :content="item.label"
      content-class="select-none"
      position="right"
      mini
    >
      <div
        class="action-item relative layout-center w-[56px] h-[56px] cursor-pointer opacity-50 hover:opacity-100"
        :class="{
          active: !isCollapsed && item.key === activity
        }"
        @click="handleActionItemClick(item)"
      >
        <component v-if="item.icon" :is="item.icon" :size="32"></component>
      </div>
    </a-tooltip>
  </div>
</template>

<style lang="scss"></style>

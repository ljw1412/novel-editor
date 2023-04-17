<script setup lang="ts">
import { RouteLocationRaw, useRouter } from 'vue-router'
import { useConfigStore, useEditorStore } from '/@/stores'

const $router = useRouter()

const configStore = useConfigStore()
const editorStore = useEditorStore()
const sidebar = configStore.sidebar
const actions = editorStore.actions

if (!actions.map((i) => i.key).includes(sidebar.activity)) {
  sidebar.activity = actions[0].key
}
$router.replace(editorStore.getActionRoute(sidebar.activity))

function handleActionItemClick(item: {
  key: Editor.ActivityActions
  route: RouteLocationRaw
}) {
  if (sidebar.activity === item.key) {
    sidebar.isCollapsed = !sidebar.isCollapsed
  } else {
    sidebar.activity = item.key
    sidebar.isCollapsed = false
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
          active: !sidebar.isCollapsed && item.key === sidebar.activity
        }"
        @click="handleActionItemClick(item)"
      >
        <component v-if="item.icon" :is="item.icon" :size="32"></component>
      </div>
    </a-tooltip>
  </div>
</template>

<style lang="scss"></style>

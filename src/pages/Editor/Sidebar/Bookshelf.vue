<script setup lang="ts" name="SidebarBookshelf">
import EditorSidebar from '../components/Sidebar.vue'

const actionbar = [
  { action: 'addVolume', title: '新建书卷', icon: 'icon-folder-add' },
  { action: 'addChapter', title: '新建章节', icon: 'icon-drive-file' }
]

function handleActionItemClick(action: string) {}

function addChapter() {}
</script>

<template>
  <EditorSidebar>
    <template #extra>
      <div
        v-for="item of actionbar"
        :key="item.action"
        :title="item.title"
        class="text-btn w-5 h-5 layout-center rounded cursor-pointer"
        @click="handleActionItemClick(item.action)"
      >
        <component :is="item.icon" :size="16" />
      </div>
    </template>

    <div class="sidebar-bookshelf"></div>
  </EditorSidebar>
</template>

<style lang="scss"></style>

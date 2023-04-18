<script setup lang="ts" name="SidebarBookshelf">
import { nextTick, ref } from 'vue'
import ChapterItem from '../components/ChapterItem.vue'
import EditorSidebar from '../components/Sidebar.vue'
import VolumeItem from '../components/VolumeItem.vue'
import { useEditorStore } from '/@/stores'

const actionbar = [
  { action: 'addVolume', title: '新建书卷', icon: 'icon-folder-add' },
  { action: 'addChapter', title: '新建章节', icon: 'icon-drive-file' }
]
const editorStore = useEditorStore()
const bookList = editorStore.bookshelf.list
const isDrag = ref(false)

function handleActionItemClick(action: string) {}

function handleDragStart(e: Event & { item: HTMLElement }) {
  isDrag.value = true
  nextTick(() => {
    e.item.classList.add('ghost')
  })
}

function handleDragMove(e: Event & { dragged: HTMLElement }) {
  setTimeout(() => {
    e.dragged.classList.add('ghost')
  }, 0)
}
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

    <draggable
      v-model="bookList"
      item-key="id"
      group="volume"
      class="sidebar-bookshelf"
      @start="handleDragStart"
      @move="handleDragMove"
      @end="isDrag = false"
    >
      <template #item="{ element }">
        <VolumeItem
          v-if="element.type === 'volume'"
          :volume="element"
        ></VolumeItem>
        <ChapterItem v-else :chapter="element"></ChapterItem>
      </template>
    </draggable>
  </EditorSidebar>
</template>

<style lang="scss"></style>

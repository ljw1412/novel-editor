<script setup lang="ts" name="SidebarBookshelf">
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import useStore from '/@/stores'
import ChapterItem from '../components/ChapterItem.vue'
import EditorSidebar from '../components/Sidebar.vue'
import VolumeItem from '../components/VolumeItem.vue'
import Chapter from '/@/classes/Chapter'
import Volume from '/@/classes/Volume'

const $router = useRouter()
const { editorStore, cacheStore } = useStore()

const actionbar = [
  { action: 'addVolume', title: '新建书卷', icon: 'icon-folder-add' },
  { action: 'addChapter', title: '新建章节', icon: 'icon-drive-file' }
]
const bookList = computed({
  get: () => editorStore.bookshelf.list,
  set(value) {
    editorStore.$patch({ bookshelf: { list: value } })
    save()
  }
})

const isAdding = ref(false)
const isDragging = ref(false)
const allPageList = computed(() => editorStore.allBookshelfPageList)

async function save() {
  // editorStore.setState('loading', '保存中…', 0)
  await editorStore.saveActionData('bookshelf')
  // editorStore.setState('success', '保存成功')
}

function createPage(isVolume = true) {
  isAdding.value = true
  const page = isVolume ? new Volume() : new Chapter()
  page.isEdit = true
  return page
}

function handleActionItemClick(action: string) {
  if (['addVolume', 'addChapter'].includes(action)) {
    bookList.value.push(createPage(action === 'addVolume'))
  }
}

function addChildChapter(page: Volume) {
  page.isCollapsed = false
  page.children.push(createPage(false))
}

async function handlePageTextChange(
  page: Volume | Chapter,
  parentPage?: Volume
) {
  console.log(isAdding.value, page, parentPage)

  if (isAdding.value) {
    if (!page.title.trim()) {
      const list = parentPage ? parentPage.children : bookList.value
      list.pop()
    } else {
      await save()
      handlePageClick(page)
    }
    isAdding.value = false
  } else {
    await save()
    handlePageClick(page)
  }
  page.isEdit = false
}

function handlePageCancel(page: Volume | Chapter, parentPage?: Volume) {
  if (isAdding.value) {
    const list = parentPage ? parentPage.children : bookList.value
    list.pop()
    isAdding.value = false
  }
}

function handlePageDelete(page: Volume | Chapter, parentPage?: Volume) {
  const list = parentPage ? parentPage.children : bookList.value
  const index = list.indexOf(page)
  if (~index) list.splice(index, 1)
  save()
  if (page.isSelected) {
    $router.replace({ name: 'EditorBookshelf' })
    cacheStore.setRouteCache('bookshelf', null)
  }
}

function handlePageClick(page: Volume | Chapter) {
  if (page.isEdit) return
  allPageList.value.forEach((page) => (page.isSelected = false))
  page.isSelected = true
  editorStore.switchPage('bookshelf', page)
  const route = {
    name: page.type === 'chapter' ? 'BookshelfChapter' : 'BookshelfBook',
    query: { id: page.id }
  }
  $router.replace(route)
  cacheStore.setRouteCache('bookshelf', route)
}

function handleCollapseChange(page: Volume, collapsed: boolean) {
  page.isCollapsed = collapsed
  save()
}

function handleDragStart(e: Event & { item: HTMLElement }) {
  isDragging.value = true
  nextTick(() => {
    e.item.classList.add('ghost')
  })
}

function handleDragMove(e: Event & { dragged: HTMLElement }) {
  setTimeout(() => {
    e.dragged.classList.add('ghost')
  }, 0)
}

function handleDragEnd(e: Event & { item: HTMLElement }) {
  isDragging.value = false
  nextTick(() => e.item.classList.remove('ghost'))
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
      @end="handleDragEnd"
    >
      <template #item="{ element: page }">
        <VolumeItem
          v-if="page.type === 'volume'"
          :page="page"
          :is-adding="isAdding"
          :is-dragging="isDragging"
          :collapsed="isDragging || page.isCollapsed"
          @text-change="handlePageTextChange"
          @cancel="handlePageCancel"
          @add-child="addChildChapter"
          @page-click="handlePageClick"
          @delete="handlePageDelete"
          @collapse-change="handleCollapseChange(page, $event)"
        ></VolumeItem>
        <ChapterItem
          v-else
          :page="page"
          :is-adding="isAdding"
          :is-dragging="isDragging"
          @text-change="handlePageTextChange"
          @cancel="handlePageCancel"
          @page-click="handlePageClick"
          @delete="handlePageDelete"
        ></ChapterItem>
      </template>
    </draggable>
  </EditorSidebar>
</template>

<style lang="scss"></style>

<script setup lang="ts" name="SidebarCharacter">
import { ref, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEditorStore, useProjectStore } from '/@/stores'
import CharacterPage from '/@/classes/Character'
import EditorSidebar from '../components/Sidebar.vue'
import CharacterItem from '../components/CharacterItem.vue'

const moduleName = 'character'
const $route = useRoute()
const $router = useRouter()
const projectStore = useProjectStore()
const editorStore = useEditorStore()
const characterList = computed({
  get: () => editorStore.character.list,
  set(value) {
    editorStore.$patch({ character: { list: value } })
    save()
  }
})
const isAdding = ref(false)
const isDrag = ref(false)

async function save() {
  editorStore.setState('loading', '保存中…', 0)
  await editorStore.saveActionData('character')
  editorStore.setState('success', '保存成功')
}

function clearSelected() {
  characterList.value.forEach((page) => {
    page.isSelected = false
  })
}

function handleHeaderBtnClick(action: string) {
  if (action === 'relationships' && $route.name !== 'CharacterRelationships') {
    clearSelected()
    $router.replace({ name: 'CharacterRelationships' })
  }
}

function addCharacter() {
  isAdding.value = true
  const page = new CharacterPage()
  page.action = moduleName
  page.isEdit = true
  characterList.value.push(page)
}

async function handlePageTextChange(page: CharacterPage) {
  if (isAdding.value) {
    if (!page.title.trim()) {
      characterList.value.pop()
    } else {
      await editorStore.saveActionData(moduleName)
      handlePageClick(page)
    }
    isAdding.value = false
  } else {
    await editorStore.saveActionData(moduleName)
    handlePageClick(page)
  }
  page.isEdit = false
}

function handlePageCancel(page: CharacterPage) {
  if (isAdding.value) {
    characterList.value.pop()
    isAdding.value = false
  }
}

function handlePageDelete(page: CharacterPage) {
  const index = characterList.value.indexOf(page)
  if (~index) characterList.value.splice(index, 1)
  // TODO: 人物关系的删除
  editorStore.saveActionData(moduleName)
  if (page.isSelected) {
    $router.replace({ name: 'EditorCharacter' })
  }
}

function handlePageClick(page: CharacterPage) {
  if (page.isEdit) return
  clearSelected()
  page.isSelected = true
  editorStore.switchPage(moduleName, page)
  const route = { name: `CharacterEditor`, query: { id: page.id } }
  $router.replace(route)
  editorStore.character.route = route
}

function handleDragStart(e: Event & { item: HTMLElement }) {
  isDrag.value = true
  nextTick(() => {
    e.item.classList.add('ghost')
  })
}

function handleDragMove(e: Event & { dragged: HTMLElement }) {
  console.log(e)

  setTimeout(() => {
    e.dragged.classList.add('ghost')
  }, 0)
}
</script>

<template>
  <EditorSidebar show-add-btn @add="addCharacter">
    <template #extra>
      <div
        title="关系图"
        class="text-btn-common h-5 px-1 layout-center rounded cursor-pointer focus-outline"
        :class="{
          'active text-white': $route.name === 'CharacterRelationships'
        }"
        tabindex="9"
        @click="handleHeaderBtnClick('relationships')"
      >
        <icon-branch />关系图
      </div>
    </template>

    <draggable
      v-model="characterList"
      item-key="id"
      group="character"
      class="sidebar-character"
      @start="handleDragStart"
      @move="handleDragMove"
      @end="isDrag = false"
    >
      <template #item="{ element: character }">
        <CharacterItem
          :character="character"
          :class="{ dragging: isDrag }"
          @text-change="handlePageTextChange"
          @cancel="handlePageCancel"
          @page-click="handlePageClick"
          @delete="handlePageDelete"
        ></CharacterItem>
      </template>
    </draggable>
  </EditorSidebar>
</template>

<style lang="scss"></style>

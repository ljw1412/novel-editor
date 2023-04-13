<script setup lang="ts" name="SidebarCharacter">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEditorStore, useProjectStore } from '/@/stores'
import CharacterPage from '/@/classes/CharacterPage'
import EditorSidebar from '../components/Sidebar.vue'
import CharacterItem from '../components/CharacterItem.vue'

const moduleName = 'character'
const $router = useRouter()
const projectStore = useProjectStore()
const editorStore = useEditorStore()
const characterList = editorStore.character.list
const isAdding = ref(false)

function clearSelected() {
  characterList.forEach((page) => {
    page.isSelected = false
  })
}

function handleHeaderBtnClick(action: string) {
  if (action === 'relationships') {
    clearSelected()
    $router.replace({ name: 'CharacterRelationships' })
  }
}

function addCharacter() {
  isAdding.value = true
  const page = new CharacterPage()
  page.action = moduleName
  page.isEdit = true
  characterList.push(page)
}

async function handlePageTextChange(page: CharacterPage) {
  if (isAdding.value) {
    if (!page.title.trim()) {
      characterList.pop()
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
    characterList.pop()
    isAdding.value = false
  }
}

function handlePageDelete(page: CharacterPage) {
  const index = characterList.indexOf(page)
  if (~index) characterList.splice(index, 1)
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
  const route = { name: `CharacterEditor`, query: { name: page.title } }
  $router.replace(route)
  editorStore.character.route = route
}
</script>

<template>
  <EditorSidebar class="shadow-xl" show-add-btn @add="addCharacter">
    <template #extra>
      <div
        title="关系图"
        class="text-btn h-5 px-1 layout-center rounded cursor-pointer"
        :class="{
          'bg-color-common text-white': $route.name === 'CharacterRelationships'
        }"
        @click="handleHeaderBtnClick('relationships')"
      >
        <icon-branch />关系图
      </div>
    </template>
    <div class="sidebar-character">
      <CharacterItem
        v-for="character of characterList"
        :character="character"
        @text-change="handlePageTextChange"
        @cancel="handlePageCancel"
        @page-click="handlePageClick"
        @delete="handlePageDelete"
      ></CharacterItem>
    </div>
  </EditorSidebar>
</template>

<style lang="scss"></style>

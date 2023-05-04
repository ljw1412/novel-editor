<script setup lang="ts" name="EditorChapter">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import useStore from '/@/stores'
import ContentContainer from '../../components/ContentContainer.vue'
import NovelEditor from '/@/utils/editor'
import { useEventListener } from '@vueuse/core'

const { editorStore, dialogStore } = useStore()

const { bookshelf } = storeToRefs(editorStore)

const currentPage = computed(() => {
  if (!bookshelf.value.data) return null
  return bookshelf.value.data.page
})

const title = computed({
  get: () => {
    if (!bookshelf.value.data) return ''
    return bookshelf.value.data.page.title
  },
  set: (v) => {
    if (v && bookshelf.value.data) {
      bookshelf.value.data.page.title = v
    }
  }
})

async function save() {
  editorStore.setState('loading', '保存中…', 0)
  await editorStore.saveActionData('bookshelf')
  editorStore.setState('success', '保存成功')
}

useEventListener('keydown', (e) => {
  const keyCode = e.keyCode || e.which || e.charCode
  const ctrlKey = e.ctrlKey || e.metaKey
  if (ctrlKey && keyCode == 83) {
    e.preventDefault()
    save()
  }
  return false
})

const editorEl = ref<HTMLElement>()
onMounted(() => {
  const keywordList = editorStore
    .getWorldPaneData('keywords')
    .map((item) => ({ key: item.id, title: item.title }))
  const editor = new NovelEditor({ style: 'min-height: 500px;' })
  editor.on('change', (content) => {
    if (currentPage.value) {
      currentPage.value.content = content
    }
  })
  editor.on('keyword-input', (dropdown, text) => {
    dropdown.setKeyWordItem(
      keywordList.filter((item) => item.title.includes(text))
    )
  })
  editor.on('keyword-click', (item) => {
    dialogStore.keywordDialog(true, item)
  })
  if (editorEl.value) {
    editor.mount(editorEl.value)
    editor.setContent(currentPage.value!.content)
  }
})
</script>

<template>
  <ContentContainer class="editor-chapter">
    <a-input v-model="title" size="large" class="mb-3" />
    <div ref="editorEl" class="chapter-editor"></div>
  </ContentContainer>
</template>

<style lang="scss"></style>

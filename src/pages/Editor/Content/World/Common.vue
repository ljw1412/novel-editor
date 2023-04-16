<script setup lang="ts" name="WorldCommon">
import { useRoute } from 'vue-router'
import { useEventListener } from '@vueuse/core'
import { useEditorStore } from '/@/stores'
import WorldItem from '/@/classes/WorldItem'
import ContentContainer from '../../components/ContentContainer.vue'

const $route = useRoute()
const editorStore = useEditorStore()

async function save() {
  editorStore.setState('loading', '保存中…', 0)
  await editorStore.saveWorldPaneData($route.meta.key as string)
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
</script>

<template>
  <ContentContainer>
    <template #default="{ page }: { page: WorldItem }">
      <a-typography-title
        class="mt-2 mb-1 pl-1"
        style="background-color: var(--editor-bg)"
      >
        {{ page.title }}
      </a-typography-title>
      <a-textarea
        v-model="page.content"
        :auto-size="{ minRows: 24 }"
        placeholder="请输入内容"
        @change="save"
      ></a-textarea>
    </template>
  </ContentContainer>
</template>

<style lang="scss"></style>

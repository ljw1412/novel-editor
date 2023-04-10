<script setup lang="ts" name="WorldCommon">
import { useRoute } from 'vue-router'
import { useEditorStore } from '/@/stores'
import ContentContainer from '../../components/ContentContainer.vue'

const $route = useRoute()
const editorStore = useEditorStore()

function handlePageContentChange() {
  editorStore.saveWorldPaneData($route.meta.key as string)
}
</script>

<template>
  <ContentContainer>
    <template #default="{ page }">
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
        @change="handlePageContentChange"
      ></a-textarea>
    </template>
  </ContentContainer>
</template>

<style lang="scss"></style>

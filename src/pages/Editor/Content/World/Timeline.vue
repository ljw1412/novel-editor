<script setup lang="ts" name="WorldTimeline">
import { useRoute } from 'vue-router'
import { useEditorStore } from '/@/stores'
import ContentContainer from '../../components/ContentContainer.vue'

const $route = useRoute()
const editorStore = useEditorStore()

async function save() {
  editorStore.setState('loading', '保存中…', 0)
  await editorStore.saveWorldPaneData('timeline')
  editorStore.setState('success', '保存成功')
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
      <template v-if="$route.query.mode === 'child'">
        <a-textarea
          v-model="page.content"
          :auto-size="{ minRows: 24 }"
          placeholder="请记录这个时间点发生的关键事件"
          @change="save"
        ></a-textarea>
      </template>
      <a-timeline v-else-if="$route.query.mode === 'root'" class="px-5">
        <a-timeline-item v-for="child of page.children">
          <a-typography-paragraph
            type="secondary"
            class="mb-1 pl-1 text-md sticky top-0 z-10"
            style="background-color: var(--editor-bg)"
          >
            {{ child.title }}
          </a-typography-paragraph>
          <a-textarea
            v-model="child.content"
            :auto-size="{ minRows: 2 }"
            placeholder="请记录这个时间点发生的关键"
            @change="save"
          ></a-textarea>
        </a-timeline-item>
      </a-timeline>
    </template>
  </ContentContainer>
</template>

<style lang="scss"></style>

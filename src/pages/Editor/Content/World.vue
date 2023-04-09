<script setup lang="ts" name="EditorWorld">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useEditorStore } from '/@/stores'

const editorStore = useEditorStore()
const { world } = storeToRefs(editorStore)
const page = computed(() => world.value.data?.page)
const parentPage = computed(() => world.value.data?.parentPage)
</script>

<template>
  <div class="editor-world">
    <template v-if="world.data && page">
      <div
        style="background-color: var(--editor-bg); z-index: 1000"
        class="sticky top-0 text-2xl py-2 px-5"
      >
        {{ (parentPage ? `${parentPage.title} - ` : '') + page.title }}
      </div>
      <div class="px-4 mb-3">
        <a-textarea
          v-model="page.content"
          :resize="false"
          :auto-size="!parentPage"
          :key="page.title"
          placeholder="请输入"
        ></a-textarea>
      </div>
      <div
        v-for="(child, index) of page.children"
        class="mb-4 px-3"
        :style="{ 'z-index': index + 1 }"
      >
        <div
          class="sticky top-[52px] z-10 text-xl mb-2 px-3"
          style="background-color: var(--editor-bg)"
        >
          {{ child.title }}
        </div>
        <a-textarea
          v-model="child.content"
          auto-size
          :key="child.title"
          placeholder="请输入"
        ></a-textarea>
      </div>
    </template>
    <div v-else class="layout-center-p text-9xl select-none opacity-30">
      世界观
    </div>
  </div>
</template>

<style lang="scss">
.editor-world {
  .arco-textarea-wrapper {
    background-color: initial;
    textarea {
      resize: none;
    }
  }
}
</style>

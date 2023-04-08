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
  <div class="editor-world relative p-3 min-h-full">
    <div
      v-if="!world.data || !page"
      class="layout-center-p text-9xl select-none opacity-30"
    >
      世界观
    </div>
    <template v-else>
      <div class="text-2xl" :class="parentPage ? 'mb-2' : 'mb-6'">
        {{ (parentPage ? `${parentPage.title} - ` : '') + page.title }}
      </div>
      <a-textarea
        v-if="parentPage"
        v-model="page.content"
        :auto-size="{ minRows: 8 }"
      ></a-textarea>
      <div v-for="item of page.children" class="mb-4">
        <div class="text-xl mb-2">{{ item.title }}</div>
        <a-textarea v-model="item.content"></a-textarea>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
.editor-world {
}
</style>

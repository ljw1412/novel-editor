<script setup lang="ts" name="WorldCommon">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useEditorStore } from '/@/stores'

const $route = useRoute()
const $router = useRouter()
const editorStore = useEditorStore()
const { world } = storeToRefs(editorStore)

const page = computed(() => world.value.data?.page)
const parentPage = computed(() => world.value.data?.parentPage)

const breadcrumbData = computed(() => {
  return [
    $route.meta.subtitle,
    parentPage.value && parentPage.value.title,
    page.value && page.value.title
  ].filter((i) => i)
})

function handlePageContentChange() {
  editorStore.saveWorldPaneData($route.meta.key as string)
}
</script>

<template>
  <div class="world-common flex flex-col h-full overflow-hidden">
    <header class="layout-lr select-none h-[40px] px-4 py-2 flex-shrink-0">
      <a-breadcrumb class="text-md">
        <template #separator><icon-right /></template>
        <a-breadcrumb-item v-for="item of breadcrumbData">
          {{ item }}
        </a-breadcrumb-item>
      </a-breadcrumb>
    </header>
    <a-scrollbar outer-class="flex-grow h-0" class="h-full overflow-auto px-6">
      <main v-if="page">
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
      </main>
    </a-scrollbar>
  </div>
</template>

<style lang="scss"></style>

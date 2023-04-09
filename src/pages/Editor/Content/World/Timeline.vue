<script setup lang="ts" name="WorldTimeline">
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
  editorStore.saveWorldPaneData('timeline')
}
</script>

<template>
  <div class="world-timeline flex flex-col h-full overflow-hidden">
    <header class="layout-lr select-none h-[40px] px-4 py-2 flex-shrink-0">
      <a-breadcrumb class="text-md">
        <template #separator><icon-right /></template>
        <a-breadcrumb-item v-for="item of breadcrumbData">
          {{ item }}
        </a-breadcrumb-item>
      </a-breadcrumb>
    </header>
    <main v-if="page" class="overflow-y-auto flex-grow h-0 px-6">
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
          @change="handlePageContentChange"
        ></a-textarea>
      </template>
      <a-timeline v-else-if="$route.query.mode === 'root'" class="px-5">
        <a-timeline-item
          v-for="child of page.children"
          dot-color="var(--app-color-common)"
        >
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
            @change="handlePageContentChange"
          ></a-textarea>
        </a-timeline-item>
      </a-timeline>
    </main>
  </div>
</template>

<style lang="scss"></style>

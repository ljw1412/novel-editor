<script setup lang="ts">
import { computed, PropType } from 'vue'
import { useRoute } from 'vue-router'
import { useEditorStore } from '/@/stores'
import Page from '/@/classes/BasePage'
import EditorState from './EditorState.vue'

const props = defineProps({
  action: { type: String as PropType<Editor.ActivityActions> }
})

const $route = useRoute()
const editorStore = useEditorStore()

const action = editorStore.getAction(
  props.action || ($route.meta.action as Editor.ActivityActions)
)

const breadcrumbData = computed(() => {
  if (!action.data) return [$route.meta.subtitle]
  const { parentPage, page } = action.data as Record<string, Page>
  return [
    $route.meta.subtitle || $route.meta.title,
    parentPage && parentPage.title,
    page && page.title
  ].filter((i) => i)
})
</script>

<template>
  <div class="content-container flex flex-col h-full overflow-hidden">
    <header
      class="content-header layout-lr select-none h-[40px] px-6 pt-4 flex-shrink-0 box-content"
    >
      <a-breadcrumb class="text-md">
        <template #separator><icon-right /></template>
        <a-breadcrumb-item v-for="item of breadcrumbData">
          {{ item }}
        </a-breadcrumb-item>
      </a-breadcrumb>
      <EditorState></EditorState>
      <slot name="extra"></slot>
    </header>
    <a-scrollbar
      outer-class="flex-grow h-0 w-full"
      class="h-full overflow-y-auto"
    >
      <main v-if="action.data && action.data.page" class="w-full px-6">
        <slot :page="action.data.page as any"></slot>
      </main>
    </a-scrollbar>
  </div>
</template>

<style lang="scss"></style>

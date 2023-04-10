<script setup lang="ts">
import { computed, PropType } from 'vue'
import { useRoute } from 'vue-router'
import { useEditorStore } from '/@/stores'
import Page from '/@/classes/Page'
import CharacterPage from '/@/classes/CharacterPage'

type MixedPage = Page & CharacterPage

const props = defineProps({
  action: { type: String as PropType<Editor.SidebarActions> }
})

const $route = useRoute()
const editorStore = useEditorStore()

const action = editorStore.getAction(
  props.action || ($route.meta.action as Editor.SidebarActions)
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
      class="content-header layout-lr select-none h-[40px] px-4 py-2 flex-shrink-0"
    >
      <a-breadcrumb class="text-md">
        <template #separator><icon-right /></template>
        <a-breadcrumb-item v-for="item of breadcrumbData">
          {{ item }}
        </a-breadcrumb-item>
      </a-breadcrumb>
      <slot name="extra"></slot>
    </header>
    <a-scrollbar outer-class="flex-grow h-0" class="h-full overflow-auto px-6">
      <main v-if="action.data && action.data.page">
        <slot :page="action.data.page as MixedPage"></slot>
      </main>
    </a-scrollbar>
  </div>
</template>

<style lang="scss"></style>

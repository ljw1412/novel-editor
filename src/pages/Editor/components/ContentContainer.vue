<script setup lang="ts">
import { computed, PropType } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useStore from '/@/stores'
import Page from '/@/classes/BasePage'
import EditorState from './EditorState.vue'

const props = defineProps({
  action: { type: String as PropType<Editor.Activity.Types> }
})
const $emit = defineEmits(['back'])

const $route = useRoute()
const $router = useRouter()
const { editorStore, cacheStore } = useStore()

const action = editorStore.getAction(
  props.action || ($route.meta.action as Editor.Activity.Types)
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

function back() {
  if (action.key === 'world') {
    editorStore.allWorldPageList.forEach((page) => (page.isSelected = false))
  } else if (action) {
    action.list.forEach((page) => (page.isSelected = false))
  }
  cacheStore.setRouteCache(action.key, null)
  $router.replace(action.route)
  $emit('back')
}
</script>

<template>
  <div class="content-container flex flex-col h-full overflow-hidden">
    <header
      class="content-header layout-lr select-none h-[56px] w-full mx-auto px-6 pt-4 flex-shrink-0"
      :class="{ 'max-w-[1200px]': !$route.meta.full }"
    >
      <div class="left flex items-center">
        <div
          class="flex-shrink-0 mr-3 hover:bg-fill-2 p-2 rounded-full cursor-pointer"
          @click="back"
        >
          <icon-arrow-left />
        </div>
        <a-breadcrumb class="text-md flex-shrink-0">
          <template #separator><icon-right /></template>
          <a-breadcrumb-item v-for="item of breadcrumbData">
            {{ item }}
          </a-breadcrumb-item>
        </a-breadcrumb>
      </div>
      <div class="right">
        <EditorState></EditorState>
        <slot name="extra"></slot>
      </div>
    </header>
    <a-scrollbar
      outer-class="flex-grow h-0 w-full"
      class="h-full w-full overflow-y-auto"
    >
      <main
        v-if="action.data && action.data.page"
        class="w-full px-6 mx-auto"
        :class="{ 'max-w-[1200px]': !$route.meta.full }"
      >
        <slot :page="action.data.page as any"></slot>
      </main>
    </a-scrollbar>
  </div>
</template>

<style lang="scss"></style>

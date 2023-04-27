<script setup lang="ts" name="WorldTimeline">
import { getCurrentInstance, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useEventListener } from '@vueuse/core'
import { useEditorStore } from '/@/stores'
import ContentContainer from '../../components/ContentContainer.vue'
import WorldItem from '/@/classes/WorldItem'
import NovelEditor from '/@/utils/editor'

const $route = useRoute()
const editorStore = useEditorStore()
const currentPage = ref<WorldItem>()

async function save() {
  editorStore.setState('loading', '保存中…', 0)
  await editorStore.saveWorldPaneData('timeline')
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

const editor = new NovelEditor()
const childEditorEl = ref<HTMLElement>()
editor.on('change', (content) => {
  if (currentPage.value) {
    currentPage.value.content = content
  }
})

function syncPage(page: WorldItem) {
  currentPage.value = page
}

onMounted(() => {
  if ($route.query.mode === 'child') {
    if (childEditorEl.value) {
      editor.mount(childEditorEl.value)
    }
  }
})
</script>

<template>
  <ContentContainer>
    <template #default="{ page }: { page: WorldItem }">
      {{ syncPage(page) }}
      <a-typography-title
        :id="`title`"
        class="mt-2 mb-1 pl-1"
        style="background-color: var(--editor-bg)"
      >
        {{ page.title }}
      </a-typography-title>
      <template v-if="$route.query.mode === 'child'">
        <div
          ref="childEditorEl"
          class="child-editor mb-2"
          placeholder="请记录这个时间点发生的关键事件"
          :data-content="page.content"
          style="min-height: 500px"
        ></div>
        <!-- <a-textarea
          v-model="page.content"
          :auto-size="{ minRows: 24 }"
          placeholder="请记录这个时间点发生的关键事件"
          @change="save"
        ></a-textarea> -->
      </template>
      <div v-else-if="$route.query.mode === 'root'" class="flex items-start">
        <a-timeline class="px-5 flex-grow">
          <a-timeline-item v-for="child of page.children">
            <a-typography-paragraph
              :id="`timepoint-${child.id}`"
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
        <a-anchor
          :change-hash="false"
          scroll-container=".editor-content .arco-scrollbar-container"
          class="sticky top-0 z-10 hidden 2xl:block"
        >
          <a-anchor-link href="#title">
            {{ page.title }}
            <template #sublist>
              <a-anchor-link
                v-for="child of page.children"
                :href="`#timepoint-${child.id}`"
              >
                {{ child.title }}
              </a-anchor-link>
            </template>
          </a-anchor-link>
        </a-anchor>
      </div>
    </template>
  </ContentContainer>
</template>

<style lang="scss"></style>

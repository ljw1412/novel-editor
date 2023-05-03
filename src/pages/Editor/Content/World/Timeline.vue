<script setup lang="ts" name="WorldTimeline">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useEventListener } from '@vueuse/core'
import { useEditorStore } from '/@/stores'
import ContentContainer from '../../components/ContentContainer.vue'
import WorldItem from '/@/classes/WorldItem'
import NovelEditor from '/@/utils/editor'
import { Notification } from '@arco-design/web-vue'

const $route = useRoute()
const editorStore = useEditorStore()
const currentPage = ref<WorldItem>()
const currentKeyword = ref<WorldItem>()
const isDisplayKeywordInfo = ref(false)

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

const keywordList = editorStore
  .getWorldPaneData('keywords')
  .map((item) => ({ key: item.id, title: item.title }))
const editor = new NovelEditor({ style: 'min-height: 500px;' })
const childEditorEl = ref<HTMLElement>()
const timepointEditorEl = ref<HTMLElement[]>()
editor.on('change', (content) => {
  if (currentPage.value) {
    currentPage.value.content = content
  }
})
editor.on('keyword-input', (dropdown, text) => {
  dropdown.setKeyWordItem(
    keywordList.filter((item) => item.title.includes(text))
  )
})
editor.on('keyword-click', ({ key, title }) => {
  console.log(key, title)

  const keyword = editorStore
    .getWorldPaneData('keywords')
    .find((item) => item.id === key)
  if (!keyword) {
    return Notification.error({
      title: `无效关键词`,
      content: `未找到关键词“${title}”…`,
      position: 'bottomRight',
      duration: 3 * 1000,
      closable: true
    })
  }
  currentKeyword.value = keyword
  isDisplayKeywordInfo.value = true
})

function syncPage(page: WorldItem) {
  currentPage.value = page
}

onMounted(() => {
  if ($route.query.mode === 'child') {
    if (childEditorEl.value) {
      editor.mount(childEditorEl.value)
      editor.setContent(currentPage.value!.content)
    }
  } else {
    let els = timepointEditorEl.value || []
    if (!Array.isArray(els) && els) {
      els = [els as HTMLElement]
    }
    els.forEach((el) => {
      const editor = new NovelEditor({
        style: 'min-height: 30px;',
        readonly: true
      })
      editor.mount(el)
    })
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
        ></div>
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
            <!-- <a-textarea
              v-model="child.content"
              :auto-size="{ minRows: 2 }"
              placeholder="请记录这个时间点发生的关键"
              @change="save"
            ></a-textarea> -->
            <div
              ref="timepointEditorEl"
              class="timepoint-editor"
              :data-content="child.content"
            ></div>
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

      <a-drawer
        v-model:visible="isDisplayKeywordInfo"
        :width="360"
        :footer="false"
        :title="currentKeyword ? currentKeyword.title : ''"
        :drawer-style="{
          top: 'var(--app-header-height)',
          bottom: 0,
          height: 'auto'
        }"
        placement="right"
        unmountOnClose
      >
        <div class="whitespace-pre-wrap">
          {{ currentKeyword ? currentKeyword.content : '' }}
        </div>
      </a-drawer>
    </template>
  </ContentContainer>
</template>

<style lang="scss"></style>

<script setup lang="ts" name="SidebarWorld">
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import $API from '/@/apis'
import { useProjectStore, useEditorStore, useConfigStore } from '/@/stores'
import Page, { PageObject } from '/@/classes/Page'
import { Notification } from '@arco-design/web-vue'
import PageItem from '../components/PageItem.vue'

const $route = useRoute()
const configStore = useConfigStore()
const projectStore = useProjectStore()
const editorStore = useEditorStore()

const summary = reactive<Page[]>([])
const timeline = reactive<Page[]>([])
const keywords = reactive<Page[]>([])
const collapsePaneList = [
  {
    key: 'summary',
    title: '简介 / summary',
    list: summary,
    allowAdd: false,
    allowAddChild: false
  },
  {
    key: 'timeline',
    title: '时间线 / timeline',
    list: timeline,
    placeholder: '输入历法名称，如：公元、宇宙历',
    childPlaceholder: '请输入年份',
    allowAdd: true,
    allowAddChild: true
  },
  {
    key: 'keywords',
    title: '关键词 / keywords',
    list: keywords,
    placeholder: '输入年份或年月或年月日',
    allowAdd: true,
    allowAddChild: false
  }
]
const activeKey = ref([configStore.sidebar['tab.world'] || 'summary'])
const isAdding = ref(false)
const allPageList = computed(() => {
  const list = [...summary, ...timeline, ...keywords]
  return [...list, ...list.map((page) => page.children || []).flat()]
})

function handeCollapseChange([activeKey]: (string | number)[]) {
  configStore.sidebar['tab.world'] = activeKey as string
}

function addItemPage(key: string, list: Page[]) {
  activeKey.value = [key]
  isAdding.value = true
  const page = new Page()
  page.action = key
  page.isEdit = true
  list.push(page)
}

function handlePageTextChange(page: Page) {
  page.isEdit = false
  if (isAdding.value) {
    const list = page.action === 'timeline' ? timeline : keywords
    if (!page.title.trim()) {
      list.pop()
    } else {
      handlePageClick(page)
      const path = projectStore.project.path || ($route.query.path as string)
      $API.Electron.project.saveData(
        `world.${page.action}`,
        list.map((item) => item.toObject()),
        path
      )
    }
    isAdding.value = false
  }
}

function handlePageCancel(page: Page, list: Page[]) {
  if (isAdding.value) {
    // const list = page.action === 'timeline' ? timeline : keywords
    list.pop()
    isAdding.value = false
  }
}

function handlePageChildTextChange(page: Page, parentPage: Page) {
  page.isEdit = false
  if (isAdding.value) {
    if (!page.title.trim()) {
      parentPage.children.pop()
    } else {
      handlePageClick(page)
      const list = page.action === 'timeline' ? timeline : keywords
      const path = projectStore.project.path || ($route.query.path as string)
      $API.Electron.project.saveData(
        `world.${page.action}`,
        list.map((item) => item.toObject()),
        path
      )
    }
    isAdding.value = false
  }
}

// function handlePageChildCancel(page: Page) {
//   if (isAdding.value) {
//     page.children.pop()
//     isAdding.value = false
//   }
// }

function handlePageClick(page: Page, parentPage?: Page) {
  if (page.isEdit) return
  allPageList.value.forEach((page) => {
    page.isSelected = false
  })
  page.isSelected = true
  editorStore.switchPage('world', page, parentPage)
}

function updateDataList(list: Page[], data: Page[]) {
  list.length = 0
  list.push(...data)
}

async function loadData() {
  const names = ['world.summary', 'world.timeline', 'world.keywords']
  const path = projectStore.project.path || ($route.query.path as string)
  const existsData = await $API.Electron.project.hasNamesData(names, path)
  const notExistsNames = Object.keys(existsData).filter(
    (key) => !existsData[key]
  )
  if (notExistsNames.length) {
    console.log('缺失的数据文件：', notExistsNames)
    await $API.Electron.project.initData(notExistsNames, path)
    Notification.info({
      title: '世界观数据文件不完整，现已修改。',
      content: notExistsNames.join('\n'),
      position: 'bottomRight',
      closable: true
    })
  }

  const { world } = await $API.Electron.project.getManyData(names, path)
  Object.keys(world).forEach((key) => {
    const data = world[key].map((page: PageObject) => Page.create(page))
    if (key === 'summary') {
      updateDataList(summary, data)
    } else if (key === 'timeline') {
      updateDataList(timeline, data)
    } else if ((key = 'keywords')) {
      updateDataList(keywords, data)
    }
  })
}

loadData()
</script>

<template>
  <div class="sidebar-world h-full">
    <a-collapse
      v-model:active-key="activeKey"
      :bordered="false"
      accordion
      class="flex flex-col h-full"
      @change="handeCollapseChange"
    >
      <a-collapse-item
        v-for="item of collapsePaneList"
        :header="item.title"
        :key="item.key"
        :disabled="isAdding"
      >
        <template #extra>
          <div
            v-if="item.allowAdd"
            v-show="!isAdding"
            class="text-btn w-5 h-5 layout-center rounded"
            @click.stop="addItemPage(item.key, item.list)"
          >
            <icon-plus />
          </div>
        </template>
        <a-scrollbar outer-class="h-full" class="h-full overflow-auto">
          <PageItem
            v-for="page of item.list"
            :page="page"
            :is-edit="page.isEdit"
            :allow-add-child="item.allowAddChild"
            :is-adding="isAdding"
            :placeholder="item.placeholder"
            @text-change="handlePageTextChange"
            @cancel="handlePageCancel(page, item.list)"
            @add-child="addItemPage(item.key, page.children)"
            @page-click="handlePageClick(page)"
          >
            <template #children>
              <PageItem
                v-for="sPage of page.children"
                :page="sPage"
                :placeholder="item.childPlaceholder"
                :is-edit="sPage.isEdit"
                is-child
                @text-change="handlePageChildTextChange(sPage, page)"
                @cancel="handlePageCancel(sPage, page.children)"
                @page-click="handlePageClick(sPage, page)"
              ></PageItem>
            </template>
          </PageItem>
        </a-scrollbar>
      </a-collapse-item>
    </a-collapse>
  </div>
</template>

<style lang="scss">
.sidebar-world {
}
</style>

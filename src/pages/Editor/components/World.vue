<script setup lang="ts" name="EditorWorld">
import { computed, reactive, ref, toRaw } from 'vue'
import { useRoute } from 'vue-router'
import $API from '/@/apis'
import { useProjectStore } from '/@/stores'
import Page, { PageObject } from '/@/classes/Page'
import { Notification } from '@arco-design/web-vue'
import PageItem from './PageItem.vue'

const $route = useRoute()
const projectStore = useProjectStore()
const activeKey = ref(['summary'])
const summary = reactive<Page[]>([])
const timeline = reactive<Page[]>([])
const keywords = reactive<Page[]>([])
const isAdding = ref(false)
const allPageList = computed(() => {
  const list = [...summary, ...timeline, ...keywords]
  return [...list, ...list.map((page) => page.children || []).flat()]
})

summary.push(new Page('测试'))
summary.length = 0

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
    placeholder: '输入年份，如：2023年、甲乙年',
    allowAdd: true,
    allowAddChild: false
  }
]

function saveWorldData() {
  const path = projectStore.project.path || ($route.query.path as string)
  const data = {
    summary: summary.map((page) => page.toObject()),
    timeline: timeline.map((page) => page.toObject()),
    keywords: keywords.map((page) => page.toObject())
  }
  $API.Electron.project.saveData('world', data, path)
}

function addItemPage(key: string) {
  activeKey.value = [key]
  isAdding.value = true
  const list = key === 'timeline' ? timeline : keywords
  const page = new Page()
  page.isEdit = true
  list.push(page)
}

function handlePageTextChange(page: Page) {
  page.isEdit = false
  if (isAdding.value) {
    const list = activeKey.value[0] === 'timeline' ? timeline : keywords
    if (!page.title.trim()) {
      list.pop()
    } else {
      handlePageClick(page)
      const path = projectStore.project.path || ($route.query.path as string)
      $API.Electron.project.saveData(
        `world.${activeKey.value[0]}`,
        list.map((item) => item.toObject()),
        path
      )
    }
    isAdding.value = false
  }
}

function handlePageCancel(page: Page) {
  if (isAdding.value) {
    const list = activeKey.value[0] === 'timeline' ? timeline : keywords
    list.pop()
    isAdding.value = false
  }
}

function handlePageAddChild(page: Page) {
  isAdding.value = true
  const childPage = new Page()
  childPage.isEdit = true
  page.children.push(childPage)
}

function handlePageChildTextChange(page: Page, parentPage: Page) {
  page.isEdit = false
  if (isAdding.value) {
    if (!page.title.trim()) {
      parentPage.children.pop()
    } else {
      handlePageClick(page)
      const list = activeKey.value[0] === 'timeline' ? timeline : keywords
      const path = projectStore.project.path || ($route.query.path as string)
      $API.Electron.project.saveData(
        `world.${activeKey.value[0]}`,
        list.map((item) => item.toObject()),
        path
      )
    }
    isAdding.value = false
  }
}

function handlePageChildCancel(page: Page) {
  if (isAdding.value) {
    page.children.pop()
    isAdding.value = false
  }
}

function handlePageClick(page: Page, parentPage?: Page) {
  if (page.isEdit) return
  allPageList.value.forEach((page) => {
    page.isSelected = false
  })
  page.isSelected = true
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
  <div class="editor-world h-full">
    <a-collapse
      v-model:active-key="activeKey"
      :bordered="false"
      accordion
      class="flex flex-col h-full"
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
            @click.stop="addItemPage(item.key)"
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
            @cancel="handlePageCancel"
            @add-child="handlePageAddChild"
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
                @cancel="handlePageChildCancel(page)"
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
.editor-world {
  .arco-collapse-item {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    border-bottom: none;

    &.arco-collapse-item-active {
      height: 0;
      flex-grow: 1;
    }

    .arco-collapse-item-header {
      padding-top: 4px;
      padding-bottom: 4px;
      padding-right: 4px;
      min-height: 34px;
    }

    .arco-collapse-item-content {
      padding: 0;

      .arco-collapse-item-content-box {
        padding: 0;
        height: 100%;
      }
      &.arco-collapse-item-content-expend {
        height: 100% !important;
      }
    }

    &:hover {
      .editor-page-item {
        .children {
          &::before {
            opacity: 0.15;
          }
        }
      }
    }
  }
}
</style>

<script setup lang="ts" name="SidebarWorld">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import $API from '/@/apis'
import { useProjectStore, useEditorStore, useConfigStore } from '/@/stores'
import Page, { PageObject } from '/@/classes/Page'
import { Notification } from '@arco-design/web-vue'
import { toTitleCase } from '/@/utils/string'
import EditorSidebar from '../components/Sidebar.vue'
import PageItem from '../components/PageItem.vue'

const $router = useRouter()
const configStore = useConfigStore()
const projectStore = useProjectStore()
const editorStore = useEditorStore()

const isAdding = ref(false)
const activeKey = ref([configStore.sidebar['tab.world'] || 'summary'])
const paneList = editorStore.worldPaneList
const allPageList = computed(() => {
  const list = paneList.map((item) => item.list).flat()
  return [list, list.map((page) => page.children || []).flat()].flat()
})

function handeCollapseChange([activeKey]: (string | number)[]) {
  configStore.sidebar['tab.world'] = activeKey as string
}

function addPage(key: string, list: Page[]) {
  activeKey.value = [key]
  isAdding.value = true
  const page = new Page()
  page.action = key
  page.isEdit = true
  list.push(page)
}

async function handlePageTextChange(
  page: Page,
  list: Page[],
  parentPage?: Page
) {
  if (isAdding.value) {
    if (!page.title.trim()) {
      list.pop()
    } else {
      await editorStore.saveWorldPaneData(page.action)
      handlePageClick(page)
    }
    isAdding.value = false
  } else {
    await editorStore.saveWorldPaneData(page.action)
    handlePageClick(page, parentPage)
  }
  page.isEdit = false
}

function handlePageCancel(page: Page, list: Page[]) {
  if (isAdding.value) {
    list.pop()
    isAdding.value = false
  }
}

function handlePageDelete(page: Page, list: Page[]) {
  const index = list.indexOf(page)
  if (~index) list.splice(index, 1)
  editorStore.saveWorldPaneData(page.action)
  if (page.isSelected) {
    $router.replace({ name: 'EditorWorld' })
  }
}

function handlePageClick(page: Page, parentPage?: Page) {
  if (page.isEdit) return
  allPageList.value.forEach((page) => {
    page.isSelected = false
  })
  page.isSelected = true
  editorStore.switchPage('world', page, parentPage)
  const route = {
    name: `World${toTitleCase(page.action)}`,
    query: { mode: parentPage ? 'child' : 'root' }
  }
  $router.replace(route)
  editorStore.world.route = route
}

async function loadData() {
  const names = paneList.map((item) => `world.${item.key}`)
  const path = projectStore.getProjectPath()
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
      duration: 10 * 1000,
      closable: true
    })
  }

  const { world } = await $API.Electron.project.getManyData(names, path)
  Object.keys(world).forEach((key) => {
    const data = world[key].map((page: PageObject) => Page.create(page))
    const list = editorStore.getWorldPaneData(key)
    if (Array.isArray(list)) {
      list.length = 0
      list.push(...data)
    }
  })
}

loadData()
</script>

<template>
  <EditorSidebar class="shadow-xl">
    <div class="sidebar-world h-full">
      <a-collapse
        v-model:active-key="activeKey"
        :bordered="false"
        accordion
        class="flex flex-col h-full"
        @change="handeCollapseChange"
      >
        <a-collapse-item
          v-for="item of paneList"
          :header="`${item.title} / ${item.key}`"
          :key="item.key"
          :disabled="isAdding"
        >
          <template #extra>
            <div
              v-if="item.allowAdd"
              v-show="!isAdding"
              :title="`添加${item.title}`"
              class="btn-add text-btn w-5 h-5 layout-center rounded cursor-pointer"
              @click.stop="addPage(item.key, item.list)"
            >
              <icon-plus />
            </div>
          </template>
          <a-scrollbar outer-class="h-full" class="h-full overflow-auto">
            <PageItem
              v-for="page of item.list"
              :page="page"
              :is-edit="page.isEdit"
              :is-adding="isAdding"
              :placeholder="item.placeholder"
              :allow-add-child="item.allowAddChild"
              :allow-collapse="item.key === 'timeline'"
              collapse-mode="button"
              @text-change="handlePageTextChange(page, item.list)"
              @cancel="handlePageCancel(page, item.list)"
              @add-child="addPage(item.key, page.children)"
              @page-click="handlePageClick(page)"
              @delete="handlePageDelete(page, item.list)"
            >
              <template #children>
                <PageItem
                  v-for="sPage of page.children"
                  :page="sPage"
                  :placeholder="item.childPlaceholder"
                  :is-edit="sPage.isEdit"
                  is-child
                  @text-change="
                    handlePageTextChange(sPage, page.children, page)
                  "
                  @cancel="handlePageCancel(sPage, page.children)"
                  @page-click="handlePageClick(sPage, page)"
                  @delete="handlePageDelete(sPage, page.children)"
                ></PageItem>
              </template>
            </PageItem>
          </a-scrollbar>
        </a-collapse-item>
      </a-collapse>
    </div>
  </EditorSidebar>
</template>

<style lang="scss">
.sidebar-world {
  &:hover {
    .page-item-wrap .children::before {
      opacity: 0.1;
    }
  }
}
</style>

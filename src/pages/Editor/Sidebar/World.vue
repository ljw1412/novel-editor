<script setup lang="ts" name="SidebarWorld">
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import useStore from '/@/stores'
import WorldItem from '/@/classes/WorldItem'
import { toTitleCase } from '/@/utils/string'
import EditorSidebar from '../components/Sidebar.vue'
import WorldItemComp from '../components/WorldItem.vue'

const $router = useRouter()
const { configStore, projectStore, editorStore, cacheStore } = useStore()

const isAdding = ref(false)
const isDrag = ref(false)
const isChildDrag = ref(false)
const activeKey = ref([configStore.sidebar.state.worldPane || 'summary'])
const paneList = editorStore.worldPaneList
const allPageList = computed(() => editorStore.allWorldPageList)

function handeCollapseChange([activeKey]: (string | number)[]) {
  configStore.sidebar.state.worldPane = activeKey as string
}

function collapseAll() {
  allPageList.value.forEach((page) => (page.isCollapsed = true))
}

async function save(type: string) {
  // editorStore.setState('loading', '保存中…', 0)
  await editorStore.saveWorldPaneData(type)
  // editorStore.setState('success', '保存成功')
}

function addPage(key: string, list: WorldItem[]) {
  activeKey.value = [key]
  isAdding.value = true
  const page = new WorldItem()
  page.type = key
  page.isEdit = true
  list.push(page)
}

async function handlePageTextChange(
  page: WorldItem,
  list: WorldItem[],
  parentPage?: WorldItem
) {
  if (isAdding.value) {
    if (!page.title.trim()) {
      list.pop()
    } else {
      await save(page.type)
      handlePageClick(page)
    }
    isAdding.value = false
  } else {
    await save(page.type)
    handlePageClick(page, parentPage)
  }
  page.isEdit = false
}

function handlePageCancel(page: WorldItem, list: WorldItem[]) {
  if (isAdding.value) {
    list.pop()
    isAdding.value = false
  }
}

function handlePageDelete(page: WorldItem, list: WorldItem[]) {
  const index = list.indexOf(page)
  if (~index) list.splice(index, 1)
  save(page.type)
  if (page.isSelected) {
    $router.replace({ name: 'EditorWorld' })
    cacheStore.routeCache.world = null
  }
}

function handlePageClick(page: WorldItem, parentPage?: WorldItem) {
  if (page.isEdit) return
  allPageList.value.forEach((page) => {
    page.isSelected = false
  })
  page.isSelected = true
  editorStore.switchPage('world', page, parentPage)
  const route = {
    name: `World${toTitleCase(page.type)}`,
    query: { mode: parentPage ? 'child' : 'root', id: page.id }
  }
  $router.replace(route)
  cacheStore.routeCache.world = route
}

function handleDragStart(e: Event & { item: HTMLElement }) {
  isDrag.value = true
  nextTick(() => {
    e.item.classList.add('ghost')
  })
}

function handleDragEnd(e: Event & { item: HTMLElement }) {
  isDrag.value = false
  nextTick(() => {
    e.item.classList.remove('ghost')
  })
}

function handleDragChange() {
  if (activeKey.value[0]) save(activeKey.value[0])
}

function handleUpdateCollapsed(page: WorldItem, collapsed: boolean) {
  page.isCollapsed = collapsed
  save(page.type)
}
</script>

<template>
  <EditorSidebar>
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
            <a-space size="mini" fill>
              <div
                v-if="item.allowAdd"
                v-show="!isAdding"
                :title="`添加${item.title}`"
                class="btn-add text-btn w-5 h-5 layout-center rounded cursor-pointer"
                @click.stop="addPage(item.key, item.list)"
              >
                <icon-plus />
              </div>
              <div
                v-if="item.allowAddChild"
                v-show="!isAdding"
                class="btn-collapse text-btn w-5 h-5 layout-center rounded cursor-pointer"
                title="折叠全部"
                @click.stop="collapseAll"
              >
                <icon-mind-mapping :size="16" />
              </div>
            </a-space>
          </template>
          <a-scrollbar outer-class="h-full" class="h-full overflow-auto">
            <draggable
              v-model="item.list"
              item-key="id"
              group="year-group"
              handle=".page-item"
              filter=".children,.btn-collapse,.btn-child-add"
              :disabled="item.key === 'summary'"
              @start="handleDragStart"
              @end="handleDragEnd"
              @change="handleDragChange"
            >
              <template #item="{ element: page }">
                <WorldItemComp
                  :page="page"
                  :is-edit="page.isEdit"
                  :is-adding="isAdding"
                  :placeholder="item.placeholder"
                  :allow-add-child="item.allowAddChild"
                  :allow-collapse="item.key === 'timeline'"
                  collapse-mode="button"
                  :collapsed="isDrag || page.isCollapsed"
                  :is-dragging="isDrag"
                  @text-change="handlePageTextChange(page, item.list)"
                  @cancel="handlePageCancel(page, item.list)"
                  @add-child="addPage(item.key, page.children)"
                  @page-click="handlePageClick(page)"
                  @delete="handlePageDelete(page, item.list)"
                  @update-collapsed="handleUpdateCollapsed(page, $event)"
                >
                  <template #children>
                    <draggable
                      v-model="page.children"
                      item-key="id"
                      group="year"
                      ghost-class="ghost"
                      handle=".page-item"
                      filter=".children"
                      @start="isChildDrag = true"
                      @end="isChildDrag = false"
                      @change="handleDragChange"
                    >
                      <template #item="{ element: sPage }">
                        <WorldItemComp
                          :page="sPage"
                          :parent="page"
                          :placeholder="item.childPlaceholder"
                          :is-edit="sPage.isEdit"
                          :is-dragging="isChildDrag"
                          @text-change="
                            handlePageTextChange(sPage, page.children, page)
                          "
                          @cancel="handlePageCancel(sPage, page.children)"
                          @page-click="handlePageClick(sPage, page)"
                          @delete="handlePageDelete(sPage, page.children)"
                        ></WorldItemComp>
                      </template>
                    </draggable>
                  </template>
                </WorldItemComp>
              </template>
            </draggable>
          </a-scrollbar>
        </a-collapse-item>
      </a-collapse>
    </div>
  </EditorSidebar>
</template>

<style lang="scss">
.sidebar-world {
  &:hover {
    // 同族的引导线
    .page-item-wrap .children::before {
      opacity: 0.1;
    }
  }
}
</style>

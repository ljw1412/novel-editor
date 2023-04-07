<script setup lang="ts" name="EditorWorld">
import { reactive, ref } from 'vue'
import PageItem from './PageItem.vue'

interface WorldPageItem {
  title: string
  content: string
  isEdit: boolean
}

const activeKey = ref(['summary'])
const timeline = reactive<WorldPageItem[]>([])
const keywords = reactive<WorldPageItem[]>([])
const isAdding = ref(false)

function addItemPage(key: string) {
  activeKey.value = [key]
  isAdding.value = true
  const list = key === 'timeline' ? timeline : keywords
  list.push({ title: '', content: '', isEdit: true })
}

function handlePageItemTextChange(item: WorldPageItem) {
  item.isEdit = false
  if (isAdding.value) {
    if (!item.title.trim()) {
      const list = activeKey.value[0] === 'timeline' ? timeline : keywords
      list.pop()
    }
    isAdding.value = false
  }
}

function handlePageItemCancel(item: WorldPageItem) {
  if (isAdding.value) {
    const list = activeKey.value[0] === 'timeline' ? timeline : keywords
    list.pop()
    isAdding.value = false
  }
}
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
        header="简介 / summary"
        key="summary"
        :disabled="isAdding"
      >
        <PageItem :item="{ title: '故事背景' }"></PageItem>
      </a-collapse-item>

      <a-collapse-item
        header="时间线 / timeline"
        key="timeline"
        :disabled="isAdding"
      >
        <template #extra>
          <div
            v-show="!isAdding"
            class="text-btn w-5 h-5 layout-center rounded"
            @click.stop="addItemPage('timeline')"
          >
            <icon-plus />
          </div>
        </template>
        <a-scrollbar outer-class="h-full" class="h-full overflow-auto">
          <PageItem
            v-for="item of timeline"
            :item="item"
            :is-edit="item.isEdit"
            @text-change="handlePageItemTextChange"
            @cancel="handlePageItemCancel"
          ></PageItem>
        </a-scrollbar>
      </a-collapse-item>

      <a-collapse-item
        header="关键词 / keywords"
        key="keywords"
        :disabled="isAdding"
      >
        <template #extra>
          <div
            v-show="!isAdding"
            class="text-btn w-5 h-5 layout-center rounded"
            @click.stop="addItemPage('keywords')"
          >
            <icon-plus />
          </div>
        </template>
        <a-scrollbar outer-class="h-full" class="h-full overflow-auto">
          <PageItem
            v-for="item of keywords"
            :item="item"
            :is-edit="item.isEdit"
            @text-change="handlePageItemTextChange"
            @cancel="handlePageItemCancel"
          ></PageItem>
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
      font-size: 13px;
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
  }
}
</style>

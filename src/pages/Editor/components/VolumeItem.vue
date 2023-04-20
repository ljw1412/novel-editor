<script setup lang="ts">
import { computed, nextTick, PropType, ref } from 'vue'
import { Modal } from '@arco-design/web-vue'
import Volume from '/@/classes/Volume'
import PageItem from './PageItem.vue'
import ChapterItem from './ChapterItem.vue'

const props = defineProps({
  // 是否在添加状态
  isAdding: Boolean,
  // 是否为拖拽状态
  isDragging: Boolean,
  // 是否折叠状态
  collapsed: { type: Boolean, default: undefined },
  // 编辑时的输入框占位符
  placeholder: {
    type: String,
    default: '请输入分组名称（第一卷、伊始、外传）'
  },
  // 页面数据
  page: { type: Object as PropType<Volume>, default: () => ({}) }
})
const $emit = defineEmits([
  'page-click',
  'text-change',
  'cancel',
  'add-child',
  'delete',
  'collapse-change'
])

const isChildSelected = computed(() => {
  return props.page.children.some((item) => item.isSelected)
})

const contextMenuList: Editor.CtxMenu.Item[] = [
  {
    label: '编辑',
    value: 'open',
    icon: 'icon-pen-fill',
    fn: () => {
      if (!props.page.isSelected) $emit('page-click', props.page)
    }
  },
  {
    label: '新建子项',
    value: 'newChild',
    icon: 'icon-drive-file',
    iconColor: 'rgb(var(--green-5))',
    fn: () => {
      $emit('add-child', props.page)
    }
  },
  {
    label: '删除',
    value: 'delete',
    icon: 'icon-delete',
    iconColor: 'rgb(var(--red-5))',
    fn: () => {
      Modal.confirm({
        title: `删除确认`,
        content: `是否确认要删除“${props.page.title}”？`,
        width: '300px',
        alignCenter: true,
        modalStyle: { 'text-align': 'center' },
        okButtonProps: { status: 'danger' },
        onOk: () => {
          $emit('delete', props.page)
        }
      })
    }
  }
]

function handlePageDragover(page: Volume, e: DragEvent) {
  if (page.type === 'volume') {
    page.isCollapsed = false
  }
}

const isChildDragging = ref(false)

function handleDragStart(e: Event & { item: HTMLElement }) {
  isChildDragging.value = true
  nextTick(() => {
    e.item.classList.add('ghost')
  })
}

function handleDragMove(e: Event & { dragged: HTMLElement }) {
  setTimeout(() => {
    e.dragged.classList.add('ghost')
  }, 0)
}

function handleDragEnd(e: Event & { item: HTMLElement }) {
  isChildDragging.value = false
  nextTick(() => e.item.classList.remove('ghost'))
}
</script>

<template>
  <div
    class="volume-item"
    :class="{
      active: page.isSelected,
      'child-selected': isChildSelected,
      collapsed: collapsed
    }"
  >
    <PageItem
      class="h-6"
      v-bind="props"
      allow-add-child
      allow-collapse
      :context-menu="contextMenuList"
      @collapse-change="$emit('collapse-change', $event)"
      @submit="$emit('text-change', $event)"
      @cancel="$emit('cancel', $event)"
      @add-child="$emit('add-child', $event)"
      @page-click="$emit('page-click', $event)"
      @dragover="handlePageDragover(page, $event)"
    ></PageItem>
    <draggable
      v-show="!collapsed"
      v-model="page.children"
      item-key="id"
      class="children relative"
      @start="handleDragStart"
      @move="handleDragMove"
      @end="handleDragEnd"
    >
      <template #item="{ element: chapter }">
        <ChapterItem
          :key="chapter.id"
          :page="chapter"
          :parent="page"
          :is-dragging="isChildDragging"
          @submit="$emit('text-change', chapter, page)"
          @cancel="$emit('cancel', chapter, page)"
          @page-click="$emit('page-click', chapter)"
          @delete="$emit('delete', chapter, page)"
        ></ChapterItem>
      </template>
    </draggable>
  </div>
</template>

<style lang="scss">
.volume-item {
  .children {
    &::before {
      content: '';
      position: absolute;
      left: 18px;
      top: 0;
      height: 100%;
      width: 1px;
      background-color: currentColor;
      transition: opacity 0.15s ease-in;
      opacity: 0;
    }
  }

  .btn-child-add {
    opacity: 0;
  }

  &.child-selected > .page-item {
    font-weight: 700;
    color: var(--app-color-common);
  }

  &.child-selected > .children::before,
  &.active > .children::before {
    background-color: var(--app-color-common);
    opacity: 0.2 !important;
  }

  &:hover,
  &:focus-within {
    .btn-child-add {
      opacity: 1;
    }
  }
}
</style>

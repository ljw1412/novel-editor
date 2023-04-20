<script setup lang="ts">
import { ref, PropType, computed } from 'vue'
import WorldItem from '/@/classes/WorldItem'
import { Modal } from '@arco-design/web-vue'
import PageItem from './PageItem.vue'

const props = defineProps({
  // 是否在添加状态
  isAdding: Boolean,
  // 是否为拖拽状态
  isDragging: Boolean,
  // 是否允许添加子项
  allowAddChild: Boolean,
  // 是否允许折叠
  allowCollapse: Boolean,
  // 是否折叠状态
  collapsed: { type: Boolean, default: undefined },
  // 默认折叠状态
  defaultCollapsed: { type: Boolean, default: true },
  // 触发折叠的行为模式：按钮 整行
  collapseMode: {
    type: String as PropType<'button' | 'line'>,
    default: 'line'
  },
  // 编辑时的输入框占位符
  placeholder: String,
  // 页面数据
  page: { type: Object as PropType<WorldItem>, default: () => ({}) },
  // 父级
  parent: Object as PropType<WorldItem>
})
const $emit = defineEmits([
  'page-click',
  'text-change',
  'cancel',
  'add-child',
  'delete',
  'collapse-change',
  'update:collapsed'
])

const _collapsed = ref(props.allowCollapse && props.defaultCollapsed)
const isCollapsed = computed(() => {
  return props.collapsed ?? _collapsed.value
})
const isChild = computed(() => !!props.parent)

const isChildSelected = computed(() => {
  return props.page.children.some((item) => item.isSelected)
})

const menuList = [
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
    label: '重命名',
    value: 'rename',
    icon: 'icon-font-colors',
    iconColor: 'rgb(var(--blue-5))',
    fn: () => {
      props.page.isEdit = true
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

function getContextMenuList() {
  if (props.page.type === 'summary') {
    return menuList.slice(0, 1)
  }
  return props.allowAddChild
    ? menuList
    : menuList.filter((item) => item.value !== 'newChild')
}
</script>

<template>
  <div
    class="world-item"
    :class="{
      active: page.isSelected,
      'child-selected': isChildSelected,
      collapsable: allowCollapse,
      collapsed: isCollapsed
    }"
  >
    <PageItem
      class="h-6"
      v-bind="props"
      :context-menu="getContextMenuList()"
      @collapse-change="$emit('collapse-change', $event)"
      @submit="$emit('text-change', $event)"
      @cancel="$emit('cancel', $event)"
      @add-child="$emit('add-child', $event)"
      @page-click="$emit('page-click', $event)"
    ></PageItem>

    <div
      v-if="!isChild && page.children && page.children.length"
      v-show="!isCollapsed"
      class="children relative"
    >
      <slot name="children"></slot>
    </div>
  </div>
</template>

<style lang="scss">
.world-item {
  &.ghost {
    .page-item {
      outline: 1px solid var(--app-color-common);
      outline-offset: -1px;
    }
  }

  .children {
    &::before {
      content: '';
      position: absolute;
      left: 40px;
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

  &.collapsable {
    > .children::before {
      left: 18px;
    }
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

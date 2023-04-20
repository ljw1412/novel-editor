<script setup lang="ts">
import { PropType } from 'vue'
import { Modal } from '@arco-design/web-vue'
import PageItem from './PageItem.vue'
import Chapter from '/@/classes/Chapter'
import Volume from '/@/classes/Volume'

const props = defineProps({
  isAdding: Boolean,
  isDragging: Boolean,
  placeholder: { type: String, default: '请输入章节名称' },
  // 页面数据
  page: { type: Object as PropType<Chapter>, default: () => ({}) },
  // 父级
  parent: Object as PropType<Volume>
})
const $emit = defineEmits(['page-click', 'text-change', 'cancel', 'delete'])

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
          $emit('delete', props.page, props.parent)
        }
      })
    }
  }
]
</script>

<template>
  <PageItem
    class="chapter-item h-6"
    :page="page"
    :parent="parent"
    :is-adding="isAdding"
    :is-dragging="isDragging"
    :placeholder="placeholder"
    :context-menu="contextMenuList"
    @submit="$emit('text-change', $event)"
    @cancel="$emit('cancel', $event)"
    @page-click="$emit('page-click', $event)"
  ></PageItem>
</template>

<style lang="scss"></style>

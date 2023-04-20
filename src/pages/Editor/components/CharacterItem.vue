<script setup lang="ts">
import { computed, PropType } from 'vue'
import { Modal } from '@arco-design/web-vue'
import { useProjectStore } from '/@/stores'
import Character from '/@/classes/Character'
import PageItem from './PageItem.vue'

const props = defineProps({
  isAdding: Boolean,
  isDragging: Boolean,
  placeholder: { type: String, default: '请输入角色名称' },
  hideLabel: Boolean,
  character: { type: Object as PropType<Character>, default: () => ({}) }
})
const $emit = defineEmits(['page-click', 'text-change', 'cancel', 'delete'])
const projectStore = useProjectStore()
const infoList = computed(() => {
  const { sex, age } = props.character
  return [
    { label: '性别', value: sex },
    { label: '年龄', value: age }
  ].filter((item) => item.value)
})

const contextMenuList = [
  {
    label: '编辑',
    value: 'open',
    icon: 'icon-pen-fill',
    fn: () => {
      if (!props.character.isSelected) $emit('page-click', props.character)
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
        content: `是否确认要删除“${props.character.title}”？`,
        width: '300px',
        alignCenter: true,
        modalStyle: { 'text-align': 'center' },
        okButtonProps: { status: 'danger' },
        onOk: () => {
          $emit('delete', props.character)
        }
      })
    }
  }
]
</script>

<template>
  <PageItem
    :page="character"
    :placeholder="placeholder"
    :is-adding="isAdding"
    :is-dragging="isDragging"
    :context-menu="contextMenuList"
    :meta-style="{ paddingLeft: '4px' }"
    class="character-item h-[50px] pl-1"
    @submit="$emit('text-change', $event)"
    @cancel="$emit('cancel', $event)"
    @page-click="$emit('page-click', $event)"
  >
    <template #prepend>
      <div class="avatar w-[50px] flex-shrink-0 layout-center">
        <a-avatar :size="40" shape="square" :key="character.avatar">
          <img
            v-if="character.avatar"
            :src="projectStore.getLocalUrl(character.avatar)"
            loading="lazy"
          />
        </a-avatar>
      </div>
    </template>
    <div class="name text-base h-5 leading-5">{{ character.title }}</div>
    <div class="info text-sm text-color-2 h-4 leading-4">
      <a-space v-if="infoList.length" size="small">
        <a-space v-for="info of infoList" :key="info.label" size="mini">
          <span v-if="!hideLabel" class="text-color-3">
            {{ info.label }}
          </span>
          <span>{{ info.value }}</span>
        </a-space>
      </a-space>
    </div>
  </PageItem>
</template>

<style lang="scss">
.character-item {
  line-height: 20px;
}
</style>

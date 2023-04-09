<script setup lang="ts">
import { ref, watch, PropType, nextTick, computed } from 'vue'
import Page from '/@/classes/Page'
import { InputInstance, Modal } from '@arco-design/web-vue'
import { useFocus } from '@vueuse/core'
import { useContextViewStore } from '/@/stores'

const props = defineProps({
  isEdit: Boolean,
  isChild: Boolean,
  allowAddChild: Boolean,
  isAdding: Boolean,
  placeholder: String,
  page: { type: Object as PropType<Page>, default: () => ({}) }
})
const $emit = defineEmits([
  'page-click',
  'text-change',
  'cancel',
  'add-child',
  'delete'
])
const pageItemEl = ref<HTMLElement>()
const inputRef = ref<InputInstance>()
const inputText = ref('')
const isInputFocus = ref(false)
const { focused: isItemFocus } = useFocus(pageItemEl)
const isChildSelected = computed(() => {
  return props.page.children.some((item) => item.isSelected)
})
const pageItemClass = computed(() => {
  const classList: (string | Record<string, boolean>)[] = [
    {
      active: props.page.isSelected,
      focus: isItemFocus.value,
      'context-menu': isContextMenu.value
    }
  ]
  if (props.isChild) {
    classList.push(props.isEdit ? 'pl-7' : 'pl-8')
  } else {
    classList.push(props.isEdit ? 'pl-[26px]' : 'pl-[34px]')
  }
  return classList
})

function handleInputFocus() {
  // console.log('handleInputFocus')
  isInputFocus.value = true
}

function handleInputBlur() {
  if (!isInputFocus.value) return
  // console.log('handleInputBlur')
  isInputFocus.value = false
  if (inputText.value.trim()) {
    props.page.title = inputText.value.trim()
    $emit('text-change', props.page)
  } else {
    $emit('cancel', props.page)
  }
}

function handleEscapeKeydown() {
  // console.log('handleEscapeKeydown')
  isInputFocus.value = false
  $emit('cancel', props.page)
}

function handlePressEnter() {
  // console.log('handlePressEnter')
  if (inputText.value.trim()) {
    props.page.title = inputText.value.trim()
    $emit('text-change', props.page)
  }
}

function handleAddSubPage() {
  $emit('add-child', props.page)
}

function handlePageClick() {
  $emit('page-click', props.page)
}

const isContextMenu = ref(false)
const contextView = useContextViewStore()
const menuList = [
  {
    label: '打开',
    value: 'open',
    fn: handlePageClick
  },
  {
    label: '新建子项',
    value: 'newChild',
    icon: 'icon-drive-file',
    iconColor: 'rgb(var(--green-5))',
    fn: handleAddSubPage
  },
  {
    label: '重命名',
    value: 'rename',
    icon: 'icon-pen-fill',
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
function showContextmenu(e: MouseEvent) {
  isContextMenu.value = true
  const { clientX, clientY } = e
  contextView.showContextMenu({
    menuList: props.allowAddChild
      ? menuList
      : menuList.filter((item) => item.value !== 'newChild'),
    position: { left: clientX, top: clientY },
    callback: (item: CtxMenu.Item | null) => {
      isContextMenu.value = false
      if (item !== null && item.fn) {
        item.fn()
      }
    }
  })
}

watch(
  () => props.isEdit,
  (v) => {
    if (v) {
      inputText.value = props.page.title || ''
      nextTick(() => {
        inputRef.value?.focus()
      })
    }
  },
  { immediate: true }
)
</script>

<template>
  <div
    class="editor-page-item"
    :class="{ active: page.isSelected, 'child-selected': isChildSelected }"
  >
    <div
      ref="pageItemEl"
      class="page-item h-6 pr-2 cursor-pointer flex items-center"
      :class="pageItemClass"
      :tabindex="page.isSelected ? 0 : -1"
      @contextmenu="showContextmenu"
      @click="handlePageClick"
    >
      <a-input
        v-if="isEdit"
        v-model="inputText"
        size="small"
        ref="inputRef"
        class="px-[7px]"
        :placeholder="placeholder"
        @contextmenu.stop
        @focus="handleInputFocus"
        @blur="handleInputBlur"
        @keydown.esc="handleEscapeKeydown"
        @press-enter="handlePressEnter"
      />
      <div v-else class="layout-lr leading-6 w-full" :title="page.title">
        <span class="truncate">{{ page.title }}</span>
        <div
          v-if="allowAddChild"
          v-show="!isAdding"
          class="text-btn w-5 h-5 mr-3 layout-center rounded flex-shrink-0"
          @click.stop="handleAddSubPage"
        >
          <icon-plus />
        </div>
      </div>
    </div>

    <div
      v-if="!isChild && page.children && page.children.length"
      class="children relative"
    >
      <slot name="children"></slot>
    </div>
  </div>
</template>

<style lang="scss">
.editor-page-item {
  .page-item {
    &:hover {
      background-color: rgba(var(--app-color-common-rgb), 0.06);
    }

    &:focus,
    &.context-menu {
      outline: 1px solid var(--app-color-common);
      outline-offset: -1px;
    }

    &:active {
      background-color: rgba(var(--app-color-common-rgb), 0.12);
    }

    &.active {
      background-color: rgba(var(--app-color-common-rgb), 0.36);
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

  &.child-selected > .children::before,
  &.active > .children::before {
    opacity: 0.15;
  }
}
</style>
<script setup lang="ts">
import { ref, watch, PropType, nextTick, computed } from 'vue'
import Page from '/@/classes/Page'
import { InputInstance, Modal } from '@arco-design/web-vue'
import { useFocus } from '@vueuse/core'
import { useContextViewStore } from '/@/stores'

const props = defineProps({
  // 是否在编辑状态
  isEdit: Boolean,
  // 是否为子项
  isChild: Boolean,
  // 是否在添加状态
  isAdding: Boolean,
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
  page: { type: Object as PropType<Page>, default: () => ({}) }
})
const $emit = defineEmits([
  'page-click',
  'text-change',
  'cancel',
  'add-child',
  'delete',
  'update-collapsed'
])
const pageItemEl = ref<HTMLElement>()
const _collapsed = ref(props.allowCollapse && props.defaultCollapsed)
const isCollapsed = computed(() => {
  return props.collapsed ?? _collapsed.value
})
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
  _collapsed.value = !isCollapsed.value
  $emit('update-collapsed', !isCollapsed.value)
  $emit('add-child', props.page)
}

function handlePageClick() {
  $emit('page-click', props.page)
  if (props.allowCollapse && props.collapseMode === 'line') {
    _collapsed.value = !isCollapsed.value
    $emit('update-collapsed', !isCollapsed.value)
  }
}

function handleCollapseBtnClick() {
  if (props.allowCollapse && props.collapseMode === 'button') {
    _collapsed.value = !isCollapsed.value
    $emit('update-collapsed', !isCollapsed.value)
  }
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

function getMenuList() {
  if (props.page.action === 'summary') {
    return menuList.slice(0, 1)
  }
  return props.allowAddChild
    ? menuList
    : menuList.filter((item) => item.value !== 'newChild')
}

function showContextmenu(e: MouseEvent) {
  isContextMenu.value = true
  const { clientX, clientY } = e
  contextView.showContextMenu({
    menuList: getMenuList(),
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
    class="page-item-wrap"
    :class="{
      active: page.isSelected,
      'child-selected': isChildSelected,
      collapsable: allowCollapse,
      collapsed: isCollapsed
    }"
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
      <div
        v-else
        class="relative layout-lr w-full leading-6"
        :title="page.title"
      >
        <div
          v-if="allowCollapse"
          class="btn-collapse absolute layout-center h-6 w-6"
          @click.stop="handleCollapseBtnClick"
        >
          <component
            :is="isCollapsed ? 'icon-right' : 'icon-down'"
            :size="16"
          />
        </div>
        <span class="truncate">{{ page.title }}</span>
        <div
          v-if="allowAddChild"
          v-show="!isAdding"
          class="btn-child-add text-btn w-5 h-5 mr-3 layout-center rounded flex-shrink-0 cursor-pointer"
          title="添加子项"
          @click.stop="handleAddSubPage"
        >
          <icon-plus />
        </div>
      </div>
    </div>

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
.page-item-wrap {
  .page-item {
    .btn-collapse {
      left: -32px;
    }

    .btn-child-add {
      opacity: 0;
    }

    &:hover {
      background-color: rgba(var(--app-color-common-rgb), 0.06);
      .btn-child-add {
        opacity: 1;
      }
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

  &.collapsable {
    > .children::before {
      left: 18px;
    }
  }

  &.child-selected > .children::before,
  &.active > .children::before {
    opacity: 0.2 !important;
  }
}
</style>

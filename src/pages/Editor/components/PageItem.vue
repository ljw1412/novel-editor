<script setup lang="ts">
import { ref, watch, PropType, nextTick, computed, StyleValue } from 'vue'
import { useFocus } from '@vueuse/core'
import { InputInstance } from '@arco-design/web-vue'
import { useContextViewStore } from '/@/stores'
import Page from '/@/classes/BasePage'
import WorldItem from '/@/classes/WorldItem'

const props = defineProps({
  // 页面数据
  page: { type: Object as PropType<Page>, default: () => ({}) },
  // 父级
  parent: Object as PropType<Page>,
  // 编辑时的输入框占位符
  placeholder: String,
  // 是否正在添加状态
  isAdding: Boolean,
  // 是否正在拖拽状态
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
  // 上下文菜单
  contextMenu: {
    type: Array as PropType<Editor.CtxMenu.Item[]>,
    default: () => []
  },
  // meta元素的样式
  metaStyle: {
    type: [String, Object, Array] as PropType<StyleValue>,
    default: ''
  }
})
const $emit = defineEmits([
  'submit',
  'cancel',
  'page-click',
  'collapse-change',
  'update:collapsed',
  'add-child'
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

const isContextMenu = ref(false)
const contextView = useContextViewStore()

const metaStyles = computed(() => {
  let paddingLeft = 34
  if (props.parent) paddingLeft += 22
  if (props.page.isEdit) paddingLeft -= 9
  return [{ paddingLeft: paddingLeft + 'px' }, props.metaStyle]
})

function showContextmenu(e: MouseEvent) {
  if (!props.contextMenu.length) return
  isContextMenu.value = true
  const { clientX, clientY } = e
  contextView.showContextMenu({
    menuList: props.contextMenu,
    position: { left: clientX, top: clientY },
    callback: (item: Editor.CtxMenu.Item | null) => {
      isContextMenu.value = false
      if (item !== null && item.fn) {
        item.fn()
      }
    }
  })
}

function toggleCollapse() {
  const value = !isCollapsed.value
  _collapsed.value = value
  $emit('collapse-change', value)
  $emit('update:collapsed', value)
}

function handlePageItemClick() {
  if (props.allowCollapse && props.collapseMode === 'line') {
    toggleCollapse()
  }
  if (!props.page.isSelected) $emit('page-click', props.page)
}

function handleCollapseBtnClick() {
  if (props.allowCollapse && props.collapseMode === 'button') {
    toggleCollapse()
  }
}

function handleAddSubPage() {
  _collapsed.value = false
  $emit('collapse-change', false)
  $emit('update:collapsed', false)
  $emit('add-child', props.page)
}

function handleInputFocus() {
  isInputFocus.value = true
}

function handleInputBlur() {
  if (!isInputFocus.value) return
  isInputFocus.value = false
  if (inputText.value.trim()) {
    props.page.title = inputText.value.trim()
    $emit('submit', props.page)
  } else {
    $emit('cancel', props.page)
  }
}

function handleEscapeKeydown() {
  isInputFocus.value = false
  $emit('cancel', props.page)
}

function handlePressEnter() {
  if (inputText.value.trim()) {
    props.page.title = inputText.value.trim()
    $emit('submit', props.page)
  }
}

watch(
  () => props.page.isEdit,
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

watch(
  () => props.page.isSelected,
  (v) => {
    if (v && props.parent instanceof WorldItem) {
      props.parent.isCollapsed = false
    }
  }
)
</script>

<template>
  <div
    ref="pageItemEl"
    class="page-item flex items-center cursor-pointer"
    :class="{
      dragging: isDragging,
      active: page.isSelected,
      focus: isItemFocus,
      'context-menu': isContextMenu
    }"
    :tabindex="page.isSelected ? 10 : -1"
    @contextmenu="showContextmenu"
    @click="handlePageItemClick"
  >
    <slot name="prepend"></slot>
    <div class="content flex-grow w-0 pr-4" :style="metaStyles">
      <a-input
        v-if="page.isEdit"
        v-model="inputText"
        ref="inputRef"
        size="small"
        class="title-input px-2"
        :placeholder="placeholder"
        @contextmenu.stop
        @focus="handleInputFocus"
        @blur="handleInputBlur"
        @keydown.esc="handleEscapeKeydown"
        @press-enter="handlePressEnter"
      />
      <div v-else class="page-meta relative">
        <div
          v-if="allowCollapse"
          class="btn-collapse layout-center-py -left-[28px] layout-center h-5 w-5 rounded"
          @click.stop="handleCollapseBtnClick"
        >
          <component
            :is="isCollapsed ? 'icon-right' : 'icon-down'"
            :size="16"
          />
        </div>
        <slot>
          <div class="layout-lr w-full" :title="page.title">
            <div class="page-title truncate leading-6">{{ page.title }}</div>
            <div class="actions mr-1">
              <div
                v-if="allowAddChild"
                v-show="!isAdding"
                class="btn-child-add text-btn w-5 h-5 layout-center rounded flex-shrink-0 cursor-pointer"
                title="添加子项"
                @click.stop="handleAddSubPage"
              >
                <icon-plus />
              </div>
            </div>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.page-item {
  &:not(.dragging) {
    transition: background-color 0.15s, outline 0.15s, font-weight 0.15s;

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
      font-weight: 700;
      background-color: rgba(var(--app-color-common-rgb), 0.36);
    }
  }

  .btn-collapse {
    transition: background-color 0.15s;

    &:hover {
      background-color: rgba(var(--app-color-common-rgb), 0.12);
    }
    &:active {
      background-color: rgba(var(--app-color-common-rgb), 0.24);
    }
  }
}
</style>

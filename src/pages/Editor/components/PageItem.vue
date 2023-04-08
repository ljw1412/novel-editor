<script setup lang="ts">
import { ref, watch, PropType, nextTick, computed } from 'vue'
import Page from '/@/classes/Page'
import type { InputInstance } from '@arco-design/web-vue'
import { useFocus } from '@vueuse/core'

const props = defineProps({
  isEdit: Boolean,
  isChild: Boolean,
  allowAddChild: Boolean,
  isAdding: Boolean,
  placeholder: String,
  page: { type: Object as PropType<Page>, default: () => ({}) }
})
const $emit = defineEmits(['page-click', 'text-change', 'cancel', 'add-child'])
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
    { active: props.page.isSelected, focus: isItemFocus.value }
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
      @click="$emit('page-click', page)"
    >
      <a-input
        v-if="isEdit"
        v-model="inputText"
        size="small"
        ref="inputRef"
        class="px-[7px]"
        :placeholder="placeholder"
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
          class="text-btn w-5 h-5 layout-center rounded flex-shrink-0"
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

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  active: Boolean,
  isEdit: Boolean,
  item: { type: Object, default: () => ({}) }
})
const $emit = defineEmits(['item-click', 'text-change', 'cancel'])
const inputText = ref('')
const isFocus = ref(false)

function handleInputFocus() {
  isFocus.value = true
}

function handleInputBlur() {
  isFocus.value = false
}

function handleEscapeKeydown() {
  if (isFocus.value) {
    isFocus.value = false
    $emit('cancel', props.item)
  }
}

function handlePressEnter() {
  if (inputText.value.trim()) {
    props.item.title = inputText.value.trim()
    $emit('text-change', props.item)
  }
}

watch(
  () => props.isEdit,
  (v) => {
    if (v) {
      inputText.value = props.item.title
    }
  }
)
</script>

<template>
  <div
    class="editor-page-item text-btn py-2 pr-2 pl-[34px] cursor-pointer text-sm"
    :class="active"
    @click="$emit('item-click')"
  >
    <a-input
      v-if="isEdit"
      v-model="inputText"
      size="mini"
      @focus="handleInputFocus"
      @blur="handleInputBlur"
      @keydown.esc="handleEscapeKeydown"
      @press-enter="handlePressEnter"
    />
    <div v-else class="leading-[24px]">{{ item.title }}</div>
  </div>
</template>

<style lang="scss">
.editor-page-item {
  &:hover {
    background-color: #fff;
  }
}
</style>

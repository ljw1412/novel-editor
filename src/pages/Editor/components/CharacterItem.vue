<script setup lang="ts">
import { computed, nextTick, PropType, ref, watch } from 'vue'
import { InputInstance } from '@arco-design/web-vue'
import { useFocus } from '@vueuse/core'
import { useProjectStore } from '/@/stores'
import CharacterPage from '/@/classes/CharacterPage'

const props = defineProps({
  isAdding: Boolean,
  placeholder: String,
  hideLabel: Boolean,
  character: { type: Object as PropType<CharacterPage>, default: () => ({}) }
})
const $emit = defineEmits(['page-click', 'text-change', 'cancel', 'delete'])
const projectStore = useProjectStore()
const itemEl = ref<HTMLElement>()
const inputRef = ref<InputInstance>()
const inputText = ref('')
const isInputFocus = ref(false)
const { focused: isItemFocus } = useFocus(itemEl)
const isContextMenu = ref(false)
const infoList = computed(() => {
  const { sex, age } = props.character
  return [
    { label: '性别', value: sex },
    { label: '年龄', value: age }
  ].filter((item) => item.value)
})

function handleInputFocus() {
  isInputFocus.value = true
}

function handleInputBlur() {
  if (!isInputFocus.value) return
  isInputFocus.value = false
  if (inputText.value.trim()) {
    props.character.title = inputText.value.trim()
    $emit('text-change', props.character)
  } else {
    $emit('cancel', props.character)
  }
}

function handleEscapeKeydown() {
  isInputFocus.value = false
  $emit('cancel', props.character)
}

function handlePressEnter() {
  if (inputText.value.trim()) {
    props.character.title = inputText.value.trim()
    $emit('text-change', props.character)
  }
}

function handlePageClick() {
  if (!props.character.isSelected) $emit('page-click', props.character)
}

watch(
  () => props.character.isEdit,
  (v) => {
    if (v) {
      inputText.value = props.character.title || ''
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
    ref="itemEl"
    class="character-item flex h-[50px] items-center px-1 cursor-pointer"
    :class="{
      active: character.isSelected,
      focus: isItemFocus,
      'context-menu': isContextMenu
    }"
    :tabindex="character.isSelected ? 10 : -1"
    @click="handlePageClick"
  >
    <div class="avatar w-[50px] flex-shrink-0 layout-center">
      <a-avatar :size="40" shape="square" :key="character.avatar">
        <img
          v-if="character.avatar"
          :src="projectStore.getLocalUrl(character.avatar)"
          loading="lazy"
        />
      </a-avatar>
    </div>
    <div class="flex-grow ml-1">
      <a-input
        v-if="character.isEdit"
        v-model="inputText"
        ref="inputRef"
        class="px-[7px]"
        :placeholder="placeholder"
        @contextmenu.stop
        @focus="handleInputFocus"
        @blur="handleInputBlur"
        @keydown.esc="handleEscapeKeydown"
        @press-enter="handlePressEnter"
      />
      <template v-else>
        <div class="name text-base">{{ character.title }}</div>
        <div class="info text-sm text-color-2">
          <a-space v-if="infoList.length" size="small">
            <a-space v-for="info of infoList" :key="info.label" size="mini">
              <span v-if="!hideLabel" class="text-color-3">
                {{ info.label }}
              </span>
              <span>{{ info.value }}</span>
            </a-space>
          </a-space>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss">
.character-item {
  line-height: 20px;

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

  .name {
    height: 20px;
    line-height: 20px;
  }
  .info {
    height: 20px;
    line-height: 20px;
  }
}
</style>

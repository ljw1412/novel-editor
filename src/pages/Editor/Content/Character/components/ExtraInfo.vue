<script setup lang="ts" name="CharacterExtraInfo">
import { PropType } from 'vue'
import { ResponsiveValue } from '@arco-design/web-vue'
import { CharacterExtraInfo } from '/@/classes/CharacterPage'

const props = defineProps({
  cols: {
    type: [Number, Object] as PropType<number | ResponsiveValue>,
    default: { xl: 2, xxl: 3 }
  },
  list: {
    type: Array as PropType<CharacterExtraInfo[]>,
    default: () => []
  }
})

function append() {
  props.list.push({ key: '', value: '' })
}

function remove(item: CharacterExtraInfo) {
  const index = props.list.indexOf(item)
  if (~index) props.list.splice(index, 1)
}
</script>

<template>
  <a-grid :cols="cols" :row-gap="8" :col-gap="8" class="character-extra-info">
    <slot name="prepend"></slot>
    <a-grid-item v-for="item of list">
      <a-input-group class="flex">
        <a-input
          v-model="item.key"
          placeholder="属性名"
          style="flex: 1 1 0%"
          class="info-name"
        />
        <a-input
          v-model="item.value"
          placeholder="属性值"
          style="flex: 2 1 0%"
          class="info-value"
        />
        <a-button status="danger" type="text" @click="remove(item)">
          <template #icon><icon-delete :size="16" /></template>
        </a-button>
      </a-input-group>
    </a-grid-item>
    <a-grid-item>
      <a-button long type="dashed" @click="append()">
        <icon-plus />追加信息
      </a-button>
    </a-grid-item>
  </a-grid>
</template>

<style lang="scss">
.character-extra-info {
  .info-name {
    input:not(:focus) {
      color: var(--color-text-2);
    }
  }
}
</style>

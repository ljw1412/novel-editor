<script setup lang="ts">
import { PropType } from 'vue'
import Volume from '/@/classes/Volume'
import ChapterItem from './ChapterItem.vue'

const props = defineProps({
  // 页面数据
  volume: { type: Object as PropType<Volume>, default: () => ({}) }
})
</script>

<template>
  <div class="volume">
    <div class="volume-item">{{ volume.title }}</div>
    <draggable v-model="volume.children" class="children">
      <template #item="{ element }">
        <ChapterItem :key="element.id" :chapter="element"></ChapterItem>
      </template>
    </draggable>
  </div>
</template>

<style lang="scss"></style>

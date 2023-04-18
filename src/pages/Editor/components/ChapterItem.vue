<script setup lang="ts">
import { PropType } from 'vue'
import Chapter from '/@/classes/Chapter'

const props = defineProps({
  // 页面数据
  chapter: { type: Object as PropType<Chapter>, default: () => ({}) }
})
</script>

<template>
  <div class="chapter-item"></div>
</template>

<style lang="scss"></style>

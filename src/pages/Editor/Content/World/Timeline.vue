<script setup lang="ts" name="WorldTimeline">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useEditorStore } from '/@/stores'

const $route = useRoute()
const editorStore = useEditorStore()
const { world } = storeToRefs(editorStore)
const page = computed(() => world.value.data?.page)
const parentPage = computed(() => world.value.data?.parentPage)
</script>

<template>
  <div class="world-timeline">
    {{ $route.query.mode }}
  </div>
</template>

<style lang="scss"></style>

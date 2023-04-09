<script setup lang="ts" name="EditorEmpty">
import { useRoute } from 'vue-router'

const $route = useRoute()
</script>

<template>
  <div
    class="editor-empty layout-center-p text-9xl select-none opacity-30 w-full text-center"
  >
    {{ $route.meta.title }}
  </div>
</template>

<style lang="scss"></style>

<script setup lang="ts" name="EditorState">
import { useEditorStore } from '/@/stores'

const editorStore = useEditorStore()
const state = editorStore.state
</script>

<template>
  <div v-if="state.status" class="editor-state" :class="state.color">
    <component v-if="state.icon" :is="state.icon" />
    <span class="ml-2">{{ state.message }}</span>
  </div>
</template>

<style lang="scss"></style>

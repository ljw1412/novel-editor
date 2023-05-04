<script setup lang="ts">
import { storeToRefs } from 'pinia'
import useStore from '/@/stores'
const { dialogStore } = useStore()

const { init } = storeToRefs(dialogStore)
</script>

<template>
  <a-modal
    v-model:visible="init.isDisplay"
    simple
    :footer="false"
    :esc-to-close="false"
    :mask-closable="false"
    width="280px"
    modal-class="px-5 pb-5 pt-0"
  >
    <a-space size="large">
      <a-spin :size="32" />
      <span>{{ init.message }}</span>
    </a-space>
  </a-modal>
</template>

<style lang="scss"></style>

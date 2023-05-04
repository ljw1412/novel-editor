<script setup lang="ts" name="EditorDialog">
import { storeToRefs } from 'pinia'
import useStore from '/@/stores'
import InitDialog from './Init.vue'
import ImageCropperDialog from '/@/components/ImageCropperDialog.vue'

const { dialogStore } = useStore()

const { cropper, keyword } = storeToRefs(dialogStore)
</script>

<template>
  <!-- 数据初始化弹窗 -->
  <InitDialog></InitDialog>
  <!-- 图片裁切弹窗 -->
  <ImageCropperDialog
    v-model:visiable="cropper.isDisplay"
    :image="cropper.image"
    v-bind="dialogStore.cropperOptions"
    @success="cropper.callback"
  >
  </ImageCropperDialog>
  <!-- 关键词抽屉 -->
  <a-drawer
    v-model:visible="keyword.isDisplay"
    :width="360"
    :footer="false"
    :title="keyword.title"
    :drawer-style="{
      top: 'var(--app-header-height)',
      bottom: 0,
      height: 'auto'
    }"
    placement="right"
    unmountOnClose
  >
    <div class="whitespace-pre-wrap">
      {{ keyword.content }}
    </div>
  </a-drawer>
</template>

<style lang="scss"></style>

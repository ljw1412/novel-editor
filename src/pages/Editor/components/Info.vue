<script setup lang="ts" name="EditorInfo">
import { computed } from 'vue'
import { useConfigStore } from '/@/stores/config'
import { formatDate } from '/@/utils/date'

const conifgStore = useConfigStore()

const projectData = computed(() => {
  return [
    { label: '标题', value: conifgStore.project.title || '' },
    { label: '作者', value: conifgStore.project.author || '' },
    { label: '简介', value: conifgStore.project.desc || '' },
    { label: '保存位置', value: conifgStore.project.path || '' },
    {
      label: '创建时间',
      value: conifgStore.project.createTime
        ? formatDate(conifgStore.project.createTime)
        : ''
    }
  ]
})
</script>

<template>
  <div class="editor-info py-2 px-3">
    <a-descriptions
      :data="projectData"
      size="small"
      layout="vertical"
      :column="1"
      :value-style="{ wordBreak: 'break-all', paddingRight: 0 }"
    />
  </div>
</template>

<style lang="scss"></style>

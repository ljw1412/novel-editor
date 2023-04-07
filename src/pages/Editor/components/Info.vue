<script setup lang="ts" name="EditorInfo">
import { computed } from 'vue'
import { useProjectStore } from '/@/stores'
import { formatDate } from '/@/utils/date'

const projectStore = useProjectStore()

const projectData = computed(() => {
  return [
    { label: '标题', value: projectStore.project.title || '' },
    { label: '作者', value: projectStore.project.author || '' },
    { label: '简介', value: projectStore.project.desc || '' },
    { label: '保存位置', value: projectStore.project.path || '' },
    {
      label: '创建时间',
      value: projectStore.project.createTime
        ? formatDate(projectStore.project.createTime)
        : ''
    }
  ]
})
</script>

<template>
  <a-scrollbar
    outer-class="editor-info h-full"
    class="h-full overflow-auto py-2 px-3"
  >
    <a-descriptions
      :data="projectData"
      size="small"
      layout="vertical"
      :column="1"
      :value-style="{ wordBreak: 'break-all', paddingRight: 0 }"
    />
  </a-scrollbar>
</template>

<style lang="scss"></style>

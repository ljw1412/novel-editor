<script setup lang="ts" name="CharacterEditor">
import { computed } from 'vue'
import { useEditorStore } from '/@/stores'
import ContentContainer from '../../components/ContentContainer.vue'
import CharacterPage from '/@/classes/CharacterPage'
</script>

<template>
  <ContentContainer>
    <template #default="{ page }">
      <a-input v-model="page.title" />
      <a-input v-model="page.sex" />
      <a-input v-model="page.birthday" />
      <div>其它信息(可自由添加键值对)</div>

      <div>时间线（默认是初始，登场时间从“时间线”里添加）</div>
      <a-textarea v-model="page.content" placeholder="请输入描述"></a-textarea>
      <div>这个时间点的立绘和照片上传</div>
      <div>人物关系</div>
    </template>
  </ContentContainer>
</template>

<style lang="scss"></style>

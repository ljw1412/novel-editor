<script setup lang="ts" name="EditorWorld"></script>

<template>
  <div class="editor-world h-[2000px]">
    <a-collapse :default-active-key="['1']" :bordered="false" accordion>
      <a-collapse-item header="简介 / summary" key="1">
        <div>故事背景</div>
      </a-collapse-item>
      <a-collapse-item header="时间线 / timeline" key="2">
        <div>Beijing Toutiao Technology Co., Ltd.</div>
        <div>Beijing Toutiao Technology Co., Ltd.</div>
        <div>Beijing Toutiao Technology Co., Ltd.</div>
      </a-collapse-item>
      <a-collapse-item header="关键词 / keyword" key="3">
        <div>Beijing Toutiao Technology Co., Ltd.</div>
        <div>Beijing Toutiao Technology Co., Ltd.</div>
        <div>Beijing Toutiao Technology Co., Ltd.</div>
      </a-collapse-item>
    </a-collapse>
  </div>
</template>

<style lang="scss"></style>

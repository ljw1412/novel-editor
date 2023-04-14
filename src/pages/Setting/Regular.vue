<script setup lang="ts" name="SettingRegular">
import { Message } from '@arco-design/web-vue'
import $API from '/@/apis'

async function createAppShortcutLink() {
  try {
    const result = await $API.Electron.shell.createAppShortcutLink()
    if (result) {
      Message.success({ content: '添加成功!', position: 'bottom' })
    } else {
      Message.error({ content: '添加失败…', position: 'bottom' })
    }
  } catch (error) {
    Message.error({ content: '添加失败…', position: 'bottom' })
  }
}
</script>

<template>
  <div class="setting-Regular">
    <a-form
      :model="{}"
      :label-col-props="{ span: 6, offset: 0 }"
      :wrapper-col-props="{ span: 18, offset: 0 }"
    >
      <a-form-item label="创建快捷方式" help="在桌面创建该应用程序的快捷方式。">
        <a-button @click="createAppShortcutLink" size="small">创建</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style lang="scss"></style>

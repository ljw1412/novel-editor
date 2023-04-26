<script setup lang="ts" name="SettingRegular">
import { Message } from '@arco-design/web-vue'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '/@/stores'
import $API from '/@/apis'
import { getPublicUrl } from '/@/utils/url'

const configStore = useConfigStore()
const { setAppConfigOption } = configStore
const { app } = storeToRefs(configStore)

async function createAppShortcutLink() {
  try {
    const result = await $API.Electron.shell.createAppShortcutLink()
    if (!result) throw new Error()
    Message.success({ content: '添加成功!', position: 'bottom' })
  } catch (error) {
    Message.error({ content: '添加失败…', position: 'bottom' })
  }
}

async function resetMenuCache() {
  const keys = ['APP_VIEW']
  keys.forEach((key) => {
    localStorage.removeItem(key)
  })
}
</script>

<template>
  <div class="setting-Regular">
    <Cell
      v-model="app.use_system_browser"
      :icon="getPublicUrl('/icons/icon-browser.svg')"
      title="使用系统浏览器"
      desc="开启后，将使用系统默认的浏览器打开外链。"
      type="switch"
      @change="setAppConfigOption('use_system_browser', $event)"
    ></Cell>
    <Cell
      model-value="创建"
      icon="icon-link"
      title="创建快捷方式"
      desc="在桌面创建该应用程序的快捷方式。"
      type="button"
      @buttom-click="createAppShortcutLink"
    ></Cell>
    <Cell
      model-value="重置"
      icon="icon-refresh"
      title="重置界面缓存"
      desc="当出现程序显示异常的时候可以尝试此项。"
      type="button"
      @buttom-click="resetMenuCache"
    ></Cell>
  </div>
</template>

<style lang="scss"></style>

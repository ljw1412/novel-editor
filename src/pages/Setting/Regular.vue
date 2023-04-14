<script setup lang="ts" name="SettingRegular">
import { Message } from '@arco-design/web-vue'
import $API from '/@/apis'

const props = defineProps({
  config: { type: Object, default: () => ({}) }
})

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

async function optionChange(key: string, value: any) {
  await $API.Electron.config.setOption(key, value)
}
</script>

<template>
  <div class="setting-Regular">
    <a-form
      :model="config"
      :label-col-props="{ span: 6, offset: 0 }"
      :wrapper-col-props="{ span: 18, offset: 0 }"
    >
      <a-form-item
        label="使用系统浏览器"
        help="开启后，将使用系统默认的浏览器打开外链。"
      >
        <a-switch
          v-model="config.use_system_browser"
          type="round"
          @change="optionChange('use_system_browser', $event)"
        ></a-switch>
      </a-form-item>

      <a-form-item label="创建快捷方式" help="在桌面创建该应用程序的快捷方式。">
        <a-button @click="createAppShortcutLink" size="small">创建</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style lang="scss"></style>

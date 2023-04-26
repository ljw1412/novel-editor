<script setup lang="ts" name="SettingInterface">
import { storeToRefs } from 'pinia'
import { useConfigStore } from '/@/stores'
import { getPublicUrl } from '/@/utils/url'

const configStore = useConfigStore()
const { setAppConfigOption, themeList } = configStore
const { app } = storeToRefs(configStore)
</script>

<template>
  <div class="setting-interface">
    <Cell
      title="主题色"
      desc="选择编辑器的全局主题色"
      icon="icon-skin"
      type="collapse"
      :collapsed="false"
      panel-style="padding: 0;"
    >
      <template #panel>
        <a-grid :cols="12" class="text-white">
          <a-grid-item v-for="theme of themeList" :key="theme.value">
            <acg-ratio-div
              class="color-item cursor-pointer"
              body-class="color-item-content"
              :class="{ active: theme.value === configStore.theme.now }"
              :style="{ backgroundColor: `var(${theme.variable})` }"
              :title="theme.name"
              @click="configStore.switchTheme(theme.value)"
            >
              <icon-check-circle
                v-if="theme.value === configStore.theme.now"
                size="24"
                class="check-icon layout-center-p"
              />
            </acg-ratio-div>
          </a-grid-item>
        </a-grid>
      </template>
    </Cell>

    <a-typography-title :heading="6" class="pl-1">编辑器</a-typography-title>
    <Cell
      title="字体大小"
      desc="选择适合的编辑器的中的字体大小"
      :icon="getPublicUrl('/icons/icon-font-size.svg')"
    >
      <template #extra>
        <a-radio-group
          v-model="app.editor_font_size"
          type="button"
          size="large"
          @change="setAppConfigOption('editor_font_size', $event)"
        >
          <a-radio :value="14" style="font-size: 14px">A</a-radio>
          <a-radio :value="16" style="font-size: 16px">A</a-radio>
          <a-radio :value="18" style="font-size: 18px">A</a-radio>
        </a-radio-group>
      </template>
    </Cell>
  </div>
</template>

<style lang="scss">
.setting-interface {
}
</style>

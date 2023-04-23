<script setup lang="ts" name="SettingInterface">
import { useConfigStore } from '/@/stores'

const configStore = useConfigStore()
const { themeList } = configStore
</script>

<template>
  <div class="setting-interface">
    <a-typography-title :heading="6">主题色</a-typography-title>
    <Cell
      title="主题色"
      desc="选择编辑器的全局主题色"
      icon="icon-skin"
      type="collapse"
      :collapsed="false"
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
              <!-- <div class="color-name absolute bottom-0 w-full text-center">
                {{ theme.name }}
              </div> -->
            </acg-ratio-div>
          </a-grid-item>
        </a-grid>
      </template>
    </Cell>

    <div class="theme-color-picker text-white"></div>
  </div>
</template>

<style lang="scss">
.setting-interface {
}
</style>

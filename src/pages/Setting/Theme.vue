<script setup lang="ts" name="SettingTheme">
import { useConfigStore } from '/@/stores'

const configStore = useConfigStore()
const { themeList } = configStore
</script>

<template>
  <div class="setting-theme">
    <h6>主题色</h6>
    <div class="theme-color-picker text-white">
      <a-grid :cols="6">
        <a-grid-item v-for="theme of themeList" :key="theme.value">
          <acg-ratio-div
            class="color-item cursor-pointer"
            body-class="color-item-content"
            :class="{ active: theme.value === configStore.theme.now }"
            :style="{ backgroundColor: `var(${theme.variable})` }"
            @click="configStore.switchTheme(theme.value)"
          >
            <icon-check-circle size="24" class="check-icon layout-center-p" />
            <div class="color-name absolute bottom-0 w-full text-center">
              {{ theme.name }}
            </div>
          </acg-ratio-div>
        </a-grid-item>
      </a-grid>
    </div>
  </div>
</template>

<style lang="scss">
.setting-theme {
  .color-item {
    .check-icon {
      display: none;
    }
    &.active {
      .check-icon {
        display: block;
      }
    }
  }
}
</style>

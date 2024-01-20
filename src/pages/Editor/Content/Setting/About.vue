<script setup lang="ts" name="SettingAbout">
import { getPublicUrl, getRandomBanner } from '/@/utils/url'

const APP_TITLE = import.meta.env.VITE_APP_TITLE
const APP_BELONG_TO = import.meta.env.VITE_APP_BELONG_TO

const appInfo = window.bridge.package
const versions = window.bridge.versions

const linkList = [
  { title: '编辑器官网', url: '', icon: 'icon-edit' },
  {
    title: '编辑器源代码',
    url: 'https://github.com/ljw1412/novel-editor',
    icon: 'icon-github'
  },
  {
    title: '御宅世界',
    url: 'https://anime.acgcon.top/',
    icon: getPublicUrl('/icons/acgcon.svg')
  }
]

const bannerBg = getRandomBanner()
</script>

<template>
  <div class="setting-about select-none">
    <acg-ratio-div
      :ratio="[25, 9]"
      class="about-header flex-shrink-0 rounded-lg overflow-hidden text-white bg-no-repeat bg-cover bg-center mb-3 max-h-[480px]"
      :style="{ backgroundImage: `url(${bannerBg})` }"
      content-class="px-7 flex flex-col justify-center"
    >
      <h3>
        {{ APP_TITLE }}
        <span class="version text-md ml-2">v{{ appInfo.version }}</span>
      </h3>
      <p class="text-gray-100 text-xl mt-2">{{ APP_BELONG_TO }}荣誉出品</p>
      <span class="absolute right-2 bottom-2 text-gray-200 select-none text-xs">
        Background Created by AI
      </span>
    </acg-ratio-div>
    <div class="text-center mb-3"></div>
    <a-grid :cols="3" :col-gap="8">
      <a-grid-item v-for="link of linkList">
        <Cell
          :icon="link.icon"
          :link="link.url"
          :title="link.title"
          size="small"
          type="link"
        ></Cell>
      </a-grid-item>
    </a-grid>
  </div>
</template>

<style lang="scss">
.setting-about {
  .about-header {
    background-color: rgb(var(--primary-6), 0.01);
    text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.75);
  }
}

#app-separate {
  .setting-about {
    padding: 16px 20px;
  }
}
</style>

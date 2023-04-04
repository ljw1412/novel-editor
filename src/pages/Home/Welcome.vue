<script setup lang="ts" name="AppHomeWelcome">
import { useConfigStore } from '/@/stores/config'

const configStore = useConfigStore()
const appInfo = window.bridge.package
const versions = window.bridge.versions

const linkList = [
  { title: '小说编辑器官网', url: '', icon: 'icon-edit' },
  {
    title: '小说编辑器源代码',
    url: 'https://github.com/ljw1412/novel-editor',
    icon: 'icon-github'
  },
  {
    title: '御宅世界',
    url: 'https://anime.acgcon.top/',
    icon: '/icons/acgcon.svg'
  }
]
</script>

<template>
  <div class="app-home-welcome flex">
    <div class="welcome-left flex-shrink-0 w-1/2">
      <a-typography-title :heading="4">启动</a-typography-title>
      <a-space direction="vertical" size="mini" fill>
        <a-link @click="$router.push({ name: 'AppHomeCreate' })">
          <icon-folder-add size="32" class="mr-2" />
          <span class="block link-text">新建项目...</span>
        </a-link>
        <a-link @click="$router.push({ name: 'AppHomeOpener' })">
          <icon-folder size="32" class="mr-2" />
          <span class="block link-text">打开项目...</span>
        </a-link>
      </a-space>
      <template v-if="configStore.recentList.length">
        <a-typography-title :heading="4">最近</a-typography-title>
        <a-space direction="vertical" size="mini" fill>
          <div
            v-for="item of configStore.recentList.slice(0, 5)"
            class="recent-item flex items-center"
          >
            <a-link class="max-w-[60%] flex-shrink-0 truncate">
              {{ item.title }}
            </a-link>
            <span class="flex-grow truncate pl-2" style="line-height: 1.5715">
              {{ item.path }}
            </span>
          </div>
        </a-space>
      </template>
    </div>

    <div class="welcome-right flex-grow ml-7">
      <a-typography-title :heading="4">关于</a-typography-title>
      <a-space direction="vertical" fill>
        <div class="mb-6">
          <p>这是一款方便对小说世界观、人物、章节等进行管理的编辑器。</p>
          <p class="mt-2">当前版本：{{ appInfo.version }}</p>
        </div>
        <a
          v-for="link of linkList"
          :key="link.title"
          :href="link.url"
          target="_blank"
          class="link-card block"
        >
          <div class="flex bg-color-2 text-[16px] p-1">
            <component
              v-if="link.icon.startsWith('icon-')"
              :is="link.icon"
              :size="24"
              class="link-icon"
            />
            <img
              v-else
              :src="link.icon"
              class="link-icon inline-block w-[1em] h-[1em]"
            />
            <div class="layout-lr link-text flex-grow">
              <span class="inline-block">{{ link.title }}</span>
              <icon-launch class="mr-2" />
            </div>
          </div>
        </a>
      </a-space>
    </div>
  </div>
</template>

<style lang="scss">
.app-home-welcome {
  .arco-typography {
    color: inherit;
  }

  .welcome-left {
    .arco-icon {
      stroke-width: 3;
    }

    .link-text {
      font-size: 16px;
      align-self: flex-end;
    }
  }

  .welcome-right {
    .link-card {
      &:hover {
        .link-text {
          color: var(--color-text-1);
        }
      }
    }

    .link-icon {
      flex-shrink: 0;
      font-size: 24px;
      margin: 8px 12px 8px 8px;
    }

    .link-text {
      transition: color 0.15s ease-out;
      color: var(--color-text-2);
    }
  }
}
</style>

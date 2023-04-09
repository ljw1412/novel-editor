<script setup lang="ts" name="HomeWelcome">
import { useRouter } from 'vue-router'
import $API from '/@/apis'
import { useProjectStore } from '/@/stores'
import { getPublicUrl } from '/@/utils/url'

const $router = useRouter()
const projectStore = useProjectStore()
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
    icon: getPublicUrl('/icons/acgcon.svg')
  }
]

async function openProject(item: Editor.RecentRecord) {
  try {
    const project = await $API.Electron.project.openProject(item.path)
    projectStore.setCurrentProject(project)
    $router.push({ name: 'AppEditor' })
  } catch (error: any) {
    console.log('openProject', error)
    if (error.data.isRemoved) {
      const index = projectStore.recentList.findIndex(
        (record) => item === record
      )
      if (~index) projectStore.recentList.splice(index, 1)
    }
  }
}
</script>

<template>
  <div class="app-home-welcome flex">
    <div class="welcome-left flex-shrink-0 w-1/2">
      <a-typography-title :heading="4">启动</a-typography-title>
      <a-space direction="vertical" size="mini" fill class="text-md">
        <a-link @click="$router.push({ name: 'HomeCreate' })">
          <icon-folder-add size="32" class="stroke-3 mr-2" />
          <span class="block self-end">新建项目...</span>
        </a-link>
        <a-link @click="$router.push({ name: 'HomeOpener' })">
          <icon-folder size="32" class="stroke-3 mr-2" />
          <span class="block self-end">打开项目...</span>
        </a-link>
      </a-space>
      <template v-if="projectStore.recentList.length">
        <a-typography-title :heading="4">最近</a-typography-title>
        <a-space direction="vertical" size="mini" fill class="text-md">
          <div
            v-for="item of projectStore.recentList.slice(0, 5)"
            class="recent-item flex items-center"
          >
            <a-link
              class="max-w-3/5 flex-shrink-0 truncate"
              @click="openProject(item)"
            >
              {{ item.title }}
            </a-link>
            <span class="flex-grow truncate pl-2" style="line-height: 1.5715">
              {{ item.path }}
            </span>
          </div>
          <a-link v-if="projectStore.recentList.length > 5">更多...</a-link>
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
          class="link-card block text-color-2 hover:text-color-1"
        >
          <div class="flex bg-color-2 text-md p-1">
            <component
              v-if="link.icon.startsWith('icon-')"
              :is="link.icon"
              :size="24"
              class="link-icon"
            />
            <img
              v-else
              :src="link.icon"
              class="link-icon text-2xl inline-block w-[1em] h-[1em]"
            />
            <div class="layout-lr flex-grow link-text">
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

  .arco-link {
    font-size: inherit;
  }

  .welcome-right {
    .link-icon {
      flex-shrink: 0;
      margin: 8px 12px 8px 8px;
    }

    .link-text {
      transition: color 0.15s ease-out;
    }
  }
}
</style>

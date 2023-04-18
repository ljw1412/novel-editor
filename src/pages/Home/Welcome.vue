<script setup lang="ts" name="HomeWelcome">
import { useRouter } from 'vue-router'
import $API from '/@/apis'
import { ulid } from 'ulid'
import useStore from '/@/stores'
import { only } from '/@/utils/object'
import { getPublicUrl } from '/@/utils/url'

const $router = useRouter()
const { projectStore, cacheStore } = useStore()
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

async function openProject(path: string) {
  const project = await $API.Electron.project.openProject(path)
  if (!project.title) project.title = '(未设置标题)'
  if (!project.id) {
    const id = ulid()
    project.id = id
    await $API.Electron.project.updateProject(path, { id })
  }
  projectStore.setCurrentProject(project)
  projectStore.addRecentProject(
    only(project, 'id title path') as Editor.RecentRecord
  )
  $router.push({ name: 'AppEditor' })
}

async function openProjectDir() {
  const { canceled, filePaths } = await $API.Electron.shell.selectDir()
  if (!canceled && filePaths.length) {
    try {
      const path = filePaths[0]
      await openProject(path)
    } catch (error) {}
  }
}

async function openRecentProject(item: Editor.RecentRecord) {
  try {
    await openProject(item.path)
  } catch (error: any) {
    console.log('openProject', error)
    if (error.data.isRemoved) {
      const index = projectStore.recentList.findIndex(
        (record) => item === record
      )
      if (~index) projectStore.recentList.splice(index, 1)
      cacheStore.removeRouteCache(item.id)
    }
  }
}
</script>

<template>
  <div class="app-home-welcome flex">
    <div class="welcome-left flex-shrink-0 w-2/3">
      <div>
        <a-typography-title :heading="4">启动</a-typography-title>
        <a-space size="large" fill class="text-md">
          <a-link @click="$router.push({ name: 'HomeCreate' })">
            <icon-folder-add size="32" class="stroke-3 mr-2" />
            <span class="block self-end">新建项目...</span>
          </a-link>
          <a-link @click="openProjectDir">
            <icon-folder size="32" class="stroke-3 mr-2" />
            <span class="block self-end">打开项目...</span>
          </a-link>
        </a-space>
      </div>

      <div v-if="projectStore.recentList.length">
        <a-typography-title :heading="4">最近</a-typography-title>
        <a-grid :cols="3" :col-gap="8" :row-gap="8">
          <a-grid-item v-for="item of projectStore.recentList.slice(0, 5)">
            <a-tooltip :content="item.path" position="bl" mini>
              <a-card
                class="cursor-pointer rounded-md"
                hoverable
                @click="openRecentProject(item)"
              >
                <a-card-meta :title="item.title"></a-card-meta>
              </a-card>
            </a-tooltip>
          </a-grid-item>
          <a-grid-item v-if="projectStore.recentList.length > 5">
            <a-card class="cursor-pointer rounded-md" hoverable>
              <a-card-meta title="更多…"></a-card-meta>
            </a-card>
          </a-grid-item>
        </a-grid>
      </div>
    </div>

    <div class="welcome-right flex-grow ml-6">
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
          <div class="flex items-center bg-color-4 text-base p-1 rounded-md">
            <component
              v-if="link.icon.startsWith('icon-')"
              :is="link.icon"
              :size="20"
              class="link-icon"
            />
            <img
              v-else
              :src="link.icon"
              class="link-icon text-xl inline-block w-[1em] h-[1em]"
            />
            <div class="layout-lr flex-grow link-text leading-5">
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
  .arco-card {
    border-color: var(--color-fill-2);

    &:hover {
      background-color: var(--color-fill-1);
    }
  }

  .arco-typography {
    color: inherit;
  }

  .arco-link {
    font-size: inherit;
  }

  .welcome-right {
    .link-icon {
      flex-shrink: 0;
      margin: 0 8px 0 2px;
    }

    .link-text {
      transition: color 0.15s ease-out;
    }
  }
}
</style>

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
        <a-space size="small" fill class="text-md">
          <Cell
            icon="icon-folder-add"
            title="新建项目..."
            size="small"
            type="link"
            hide-link-icon
            style="width: 140px"
            :link="{ name: 'HomeCreate' }"
          ></Cell>
          <Cell
            icon="icon-folder"
            title="打开项目..."
            size="small"
            style="width: 140px"
            @click="openProjectDir"
          ></Cell>
        </a-space>
      </div>

      <div v-if="projectStore.recentList.length">
        <a-typography-title :heading="4">最近</a-typography-title>
        <a-grid :cols="3" :col-gap="8" :row-gap="8">
          <a-grid-item v-for="item of projectStore.recentList.slice(0, 5)">
            <a-tooltip :content="item.path" position="bl" mini>
              <Cell
                :title="item.title"
                :desc="item.path"
                size="small"
                @click="openRecentProject(item)"
              ></Cell>
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

        <Cell
          v-for="link of linkList"
          :icon="link.icon"
          :link="link.url"
          :title="link.title"
          size="mini"
          type="link"
        ></Cell>
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

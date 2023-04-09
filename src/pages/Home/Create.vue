<script setup lang="ts" name="HomeCreate">
import { ref, reactive, watch, toRaw } from 'vue'
import $API from '/@/apis'
import { FormInstance, Notification } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { only } from '/@/utils/object'
import { useProjectStore } from '/@/stores'

const $router = useRouter()
const prjStore = useProjectStore()
const formRef = ref<FormInstance>()
const sep = ref('')
const projectDir = ref('')
const project = reactive<Editor.Project>({
  title: '',
  author: '',
  desc: '',
  path: '',
  createTime: ''
})

async function init() {
  sep.value = await $API.Electron.shell.getSeparator()
  projectDir.value = await $API.Electron.project.getDefaultDir()
}

async function selectProjectDir() {
  try {
    const result = await $API.Electron.shell.selectDir({
      defaultPath: projectDir.value
    })
    const { canceled, filePaths } = result
    if (canceled) return
    if (filePaths.length) {
      projectDir.value = filePaths[0]
    }
  } catch (error) {}
}

async function create() {
  const errors = await formRef.value?.validate()
  if (errors) return

  try {
    const prj = await $API.Electron.project.createProject(toRaw(project))
    prjStore.addRecentProject(only(prj, 'title path') as Editor.RecentRecord)
    prjStore.setCurrentProject(prj)
    $router.push({ name: 'AppEditor' })
  } catch (error: any) {}
}

watch(
  () => [projectDir.value, project.title],
  ([projectDir, title]) => {
    title = project.title.trim()
    project.path = [projectDir, title || '{项目名称}', ''].join(sep.value)
  }
)

init()
</script>

<template>
  <div class="app-home-create">
    <a-page-header title="创建项目" @back="$router.back"></a-page-header>

    <a-form
      ref="formRef"
      :model="project"
      auto-label-width
      class="w-3/4 mx-auto"
    >
      <a-form-item
        label="名称"
        field="title"
        hide-asterisk
        :rules="[{ required: true, maxLength: 50, message: '请填写名称' }]"
      >
        <a-input v-model="project.title" show-word-limit :max-length="50" />
      </a-form-item>
      <a-form-item
        label="作者"
        field="author"
        hide-asterisk
        :rules="[{ required: true, maxLength: 200, message: '请填写作者' }]"
      >
        <a-input v-model="project.author" show-word-limit :max-length="20" />
      </a-form-item>
      <a-form-item label="简介" field="desc">
        <a-textarea
          v-model="project.desc"
          show-word-limit
          :max-length="300"
          :auto-size="{ minRows: 6, maxRows: 6 }"
        />
      </a-form-item>
      <a-form-item
        label="保存位置"
        field="path"
        hide-asterisk
        :rules="[{ required: true, message: '请填写保存位置' }]"
      >
        <a-input-group class="flex w-full">
          <a-input v-model="project.path" readonly></a-input>
          <a-button @click="selectProjectDir">浏览</a-button>
        </a-input-group>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" long @click="create">创建</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style lang="scss"></style>

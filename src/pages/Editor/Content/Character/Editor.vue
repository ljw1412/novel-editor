<script setup lang="ts" name="CharacterEditor">
import { ref, reactive, computed, watch } from 'vue'
import {
  useDebounceFn,
  useEventListener,
  useFileSystemAccess
} from '@vueuse/core'
import $API from '/@/apis'
import { useEditorStore, useProjectStore } from '/@/stores'
import ContentContainer from '../../components/ContentContainer.vue'
import ImageCropperDialog from '/@/components/ImageCropperDialog.vue'
import CharacterPage from '/@/classes/CharacterPage'

const editorStore = useEditorStore()
const projectStore = useProjectStore()

const fs = useFileSystemAccess({
  dataType: 'Blob',
  types: [{ description: '图片', accept: { 'image/*': [] } }],
  excludeAcceptAllOption: true
})
const cropper = reactive({
  isDisplay: false,
  enlarge: 1,
  image: '' as string | Blob,
  size: '' as 'sprite' | 'avatar',
  ratio: [1, 1]
})

const saveState = ref({ status: '', icon: '', message: '' })

const clearSaveMsg = useDebounceFn(() => {
  saveState.value = { status: '', icon: '', message: '' }
}, 3000)
async function save() {
  saveState.value = {
    status: 'saving',
    icon: 'icon-loading',
    message: '保存中…'
  }
  await editorStore.saveActionData('character')
  saveState.value = {
    status: 'success',
    icon: 'icon-check',
    message: '保存成功'
  }
  clearSaveMsg()
}

function removeImage(size: 'sprite' | 'avatar', page: CharacterPage) {
  if (size === 'sprite') {
    page.image = ''
  } else {
    page.avatar = ''
  }
  save()
}

async function handleImageClick(size: 'sprite' | 'avatar') {
  try {
    await fs.open()
    if (fs.file.value) {
      cropper.size = size
      cropper.image = URL.createObjectURL(fs.file.value)
      cropper.ratio = size === 'avatar' ? [1, 1] : [3, 4]
      cropper.enlarge = size === 'avatar' ? 1 : 2
      cropper.isDisplay = true
    }
  } catch (error) {}
}

async function cropperSprite(spritePath: string) {
  const url = projectStore.getLocalUrl(spritePath)
  cropper.enlarge = 1
  cropper.size = 'avatar'
  cropper.image = url
  cropper.ratio = [1, 1]
  cropper.isDisplay = true
}

async function handleCropSuccess(
  data: { result: string },
  page: CharacterPage
) {
  const filename = `${page.title}_${cropper.size}.jpg`
  const path = projectStore.project.path
  const filepath = await $API.Electron.project.saveImage(
    data.result,
    filename,
    path
  )
  if (cropper.size === 'avatar') {
    page.avatar = filepath
  } else {
    page.image = filepath
  }
  save()
}

function appInfo(page: CharacterPage) {
  if (!page.info || !Array.isArray(page.info)) {
    page.info = []
  }
  page.info.push({ key: '', value: '' })
}

function removeInfo(item: { key: string; value: string }, page: CharacterPage) {
  const index = page.info.indexOf(item)
  if (~index) {
    page.info.splice(index, 1)
  }
}

function addTimeline(page: CharacterPage) {}

function removeTimeline(key: string | number, page: CharacterPage) {}

useEventListener('keydown', (e) => {
  const keyCode = e.keyCode || e.which || e.charCode
  const ctrlKey = e.ctrlKey || e.metaKey
  if (ctrlKey && keyCode == 83) {
    e.preventDefault()
    save()
  }
  return false
})
</script>

<template>
  <ContentContainer class="character-editor">
    <template #extra>
      <div
        v-if="saveState.status"
        :class="{
          'text-red-500': saveState.status === 'error',
          'text-green-500': saveState.status === 'success'
        }"
      >
        <component v-if="saveState.icon" :is="saveState.icon" />
        <span class="ml-2">{{ saveState.message }}</span>
      </div>
    </template>
    <template #default="{ page }">
      <div class="flex items-start pt-4">
        <div class="flex-shrink-0 flex w-[320px] mr-2 select-none">
          <acg-ratio-div
            :ratio="[3, 4]"
            class="sprite flex-grow cursor-pointer"
            @click="handleImageClick('sprite')"
          >
            <img
              v-if="page.image"
              :src="projectStore.getLocalUrl(page.image, true)"
              class="object-contain"
            />
            <div class="label layout-center-p">人物图</div>
            <div
              class="action-view absolute top-0 left-0 layout-center flex-col w-full h-full text-white"
            >
              <a-button
                v-if="page.image"
                class="absolute right-0 top-0"
                status="danger"
                @click.stop="removeImage('sprite', page)"
              >
                <template #icon><icon-delete /></template>
              </a-button>
              <icon-upload :size="36" />
              <div class="mt-2">上传人物图</div>
            </div>
          </acg-ratio-div>
          <div class="inline-block w-[100px] flex-shrink-0 ml-2">
            <acg-ratio-div class="avatar relative">
              <img
                v-if="page.avatar"
                :src="projectStore.getLocalUrl(page.avatar, true)"
                class="object-contain"
              />
              <div class="label layout-center-p">头像</div>
              <div class="action-view absolute top-0 left-0 w-full h-full">
                <a-space size="mini" class="layout-center-p">
                  <a-button
                    v-if="page.image"
                    title="裁剪人物图"
                    size="small"
                    @click="cropperSprite(page.image)"
                  >
                    <template #icon><icon-scissor :size="18" /></template>
                  </a-button>
                  <a-button
                    title="上传图片"
                    size="small"
                    @click="handleImageClick('avatar')"
                  >
                    <template #icon><icon-upload :size="18" /></template>
                  </a-button>
                  <a-button
                    v-if="page.avatar"
                    title="清除图片"
                    size="small"
                    status="danger"
                    @click.stop="removeImage('avatar', page)"
                  >
                    <template #icon><icon-delete :size="18" /></template>
                  </a-button>
                </a-space>
              </div>
            </acg-ratio-div>
          </div>
        </div>
        <a-space direction="vertical" fill class="flex-grow">
          <a-input v-model="page.title" placeholder="姓名" class="name-input" />
          <a-space>
            <a-select
              v-model="page.sex"
              allow-create
              allow-clear
              placeholder="未设置性别"
              class="w-[160px]"
              :trigger-props="{ autoFitPopupMinWidth: true }"
            >
              <template #prefix>性别</template>
              <a-option>男</a-option>
              <a-option>女</a-option>
              <template #footer>
                <div class="text-center text-color-2">或手动输入</div>
              </template>
            </a-select>

            <a-input v-model="page.age" placeholder="年龄" class="w-[140px]">
              <template #prefix>年龄</template>
              <template #suffix>岁</template>
            </a-input>
            <a-input
              v-model="page.birthday"
              placeholder="生日"
              class="w-[200px]"
            >
              <template #prefix>生日</template>
            </a-input>
          </a-space>

          <a-grid
            :cols="{ xl: 2, xxl: 4 }"
            :row-gap="8"
            :col-gap="8"
            class="more-info-grid max-w-[1200px]"
          >
            <a-grid-item v-for="item of page.info">
              <a-input-group class="flex">
                <a-input
                  v-model="item.key"
                  placeholder="属性名"
                  style="flex: 1 1 0%"
                  class="info-name"
                />
                <a-input
                  v-model="item.value"
                  placeholder="属性值"
                  style="flex: 2 1 0%"
                  class="info-value"
                />
                <a-button
                  status="danger"
                  type="text"
                  @click="removeInfo(item, page)"
                >
                  <template #icon><icon-delete :size="16" /></template>
                </a-button>
              </a-input-group>
            </a-grid-item>
            <a-grid-item>
              <a-button long type="dashed" @click="appInfo(page)">
                <icon-plus />追加信息
              </a-button>
            </a-grid-item>
          </a-grid>

          <a-textarea
            v-model="page.content"
            placeholder="请人物描述"
            :auto-size="{ minRows: 6, maxRows: 6 }"
          ></a-textarea>
        </a-space>
      </div>

      <h5 class="mt-6">
        <span>时间线</span>
        <span class="text-sm text-color-2">（上述信息默认为故事初始时点）</span>
      </h5>
      <a-tabs
        type="card"
        editable
        show-add-button
        auto-switch
        @add="addTimeline(page)"
        @delete="removeTimeline($event, page)"
      >
        <template #extra></template>
      </a-tabs>

      <div>这个时间点的立绘和照片上传</div>
      <div>人物关系</div>

      <ImageCropperDialog
        v-model:visiable="cropper.isDisplay"
        mode="cover"
        type="base64"
        fixed
        fixed-box
        center-box
        :enlarge="cropper.enlarge"
        :fixed-number="cropper.ratio"
        :auto-crop-width="200 * cropper.ratio[0]"
        :auto-crop-height="200 * cropper.ratio[1]"
        :image="cropper.image"
        @success="handleCropSuccess($event, page)"
      ></ImageCropperDialog>
    </template>
  </ContentContainer>
</template>

<style lang="scss">
.character-editor {
  line-height: 1;

  .name-input {
    // height: 42px;
    font-size: 28px;

    > .arco-input {
      font-size: inherit !important;
      line-height: inherit !important;
    }
  }

  .more-info-grid {
    .info-name {
      input {
        &:not(:focus) {
          color: var(--color-text-2);
        }
      }
    }
  }

  .sprite,
  .avatar {
    // outline: 1px solid var(--app-color-common);
    background-color: var(--color-fill-2);

    img {
      position: relative;
      z-index: 1;
    }

    .label {
      z-index: 0;
      opacity: 0.5;
      font-size: 16px;
    }

    .action-view {
      transition: all 0.2s;
      opacity: 0;
      z-index: 5;
    }

    &:hover {
      .action-view {
        opacity: 1;
        background-color: rgba(0, 0, 0, 0.5);
      }
    }
  }
}
</style>

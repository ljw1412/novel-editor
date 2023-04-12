<script setup lang="ts" name="CharacterFgimage">
import { PropType, reactive } from 'vue'
import { useFileSystemAccess } from '@vueuse/core'
import { useDialogStore, useProjectStore } from '/@/stores'
import { CharacterExtraData } from '/@/classes/CharacterPage'
import $API from '/@/apis'

const props = defineProps({
  title: { type: String, default: '' },
  width: { type: String, default: '100%' },
  avatarWidth: { type: String, default: '100px' },
  data: { type: Object as PropType<CharacterExtraData>, default: () => ({}) }
})
const $emit = defineEmits(['removed', 'change'])
const projectStore = useProjectStore()
const dialogStore = useDialogStore()
const cropper = dialogStore.cropper

const fs = useFileSystemAccess({
  dataType: 'Blob',
  types: [{ description: '图片', accept: { 'image/*': [] } }],
  excludeAcceptAllOption: true
})

async function handleCropSuccess({ result }: { result: string }) {
  const filename = `${props.title}_${cropper.data.size}.jpg`
  const path = projectStore.project.path
  const filepath = await $API.Electron.project.saveImage(result, filename, path)
  if (cropper.data.size === 'avatar') {
    props.data.avatar = filepath
  } else {
    props.data.image = filepath
  }
  $emit('change')
}

async function handleImageClick(size: 'sprite' | 'avatar') {
  try {
    await fs.open()
    if (fs.file.value) {
      cropper.image = URL.createObjectURL(fs.file.value)
      cropper.options.enlarge = size === 'avatar' ? 1 : 2
      cropper.options.fixedNumber = size === 'avatar' ? [1, 1] : [3, 4]
      cropper.data = { size }
      cropper.callback = handleCropSuccess
      cropper.isDisplay = true
    }
  } catch (error) {}
}

function removeImage(size: 'sprite' | 'avatar') {
  if (size === 'sprite') {
    props.data.image = ''
  } else {
    props.data.avatar = ''
  }
  $emit('removed')
}

async function cropperSprite(spritePath?: string) {
  if (!spritePath) return
  const url = projectStore.getLocalUrl(spritePath)
  cropper.image = url
  cropper.data = { size: 'avatar' }
  cropper.options.enlarge = 1
  cropper.options.fixedNumber = [1, 1]
  cropper.callback = handleCropSuccess
  cropper.isDisplay = true
}
</script>

<template>
  <div
    class="character-foreground-image flex items-start select-none"
    :style="{ width }"
  >
    <acg-ratio-div
      :ratio="[3, 4]"
      class="sprite flex-grow cursor-pointer"
      @click="handleImageClick('sprite')"
    >
      <img
        v-if="data.image"
        :src="projectStore.getLocalUrl(data.image, true)"
        class="object-contain"
      />
      <div class="label layout-center-p">人物图</div>
      <div
        class="action-view absolute top-0 left-0 layout-center flex-col w-full h-full text-white"
      >
        <a-button
          v-if="data.image"
          class="absolute right-0 top-0"
          status="danger"
          @click.stop="removeImage('sprite')"
        >
          <template #icon><icon-delete /></template>
        </a-button>
        <icon-upload :size="28" />
        <div class="mt-2">上传人物图</div>
      </div>
    </acg-ratio-div>

    <acg-ratio-div
      class="avatar relative flex-shrink-0 ml-2"
      :style="{ width: avatarWidth }"
    >
      <img
        v-if="data.avatar"
        :src="projectStore.getLocalUrl(data.avatar, true)"
        class="object-contain"
      />
      <div class="label layout-center-p">头像</div>
      <div class="action-view absolute top-0 left-0 w-full h-full">
        <a-space size="mini" class="layout-center-p">
          <a-button
            v-if="data.image"
            title="裁剪人物图"
            size="small"
            @click="cropperSprite(data.image)"
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
            v-if="data.avatar"
            title="清除图片"
            size="small"
            status="danger"
            @click.stop="removeImage('avatar')"
          >
            <template #icon><icon-delete :size="18" /></template>
          </a-button>
        </a-space>
      </div>
    </acg-ratio-div>
  </div>
</template>

<style lang="scss">
.character-foreground-image {
  .sprite,
  .avatar {
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

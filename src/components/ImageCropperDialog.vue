<script setup lang="ts">
import { computed, PropType, ref } from 'vue'
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'

const $emit = defineEmits(['update:visiable', 'success'])
const props = defineProps({
  visiable: Boolean,
  image: [String, Blob],
  type: {
    type: String as PropType<'base64' | 'blob'>,
    default: 'blob'
  },
  // 裁剪生成图片的格式
  outputType: {
    type: String as PropType<'jpeg' | 'png' | 'webp'>,
    default: 'jpeg'
  },
  canScale: { type: Boolean, default: true },
  // 是否开启截图框宽高固定比例
  fixed: Boolean,
  // 截图框的宽高比例
  fixedNumber: { type: Array as PropType<number[]>, default: [1, 1] },
  // 是否输出原图比例的截图
  full: Boolean,
  // 固定截图框大小
  fixedBox: Boolean,
  // 图片默认渲染方式(可选项：contain , cover, 100px, 100% auto)
  mode: { type: String, default: 'contain' },
  // 是否默认生成截图框
  autoCrop: { type: Boolean, default: true },
  // 只有自动截图开启 宽度高度才生效
  autoCropWidth: { type: Number, default: 120 },
  autoCropHeight: { type: Number, default: 120 },
  // 截图框是否被限制在图片里面
  centerBox: Boolean,
  // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
  infoTrue: Boolean,
  // 上传图片是否可以移动
  canMove: { type: Boolean, default: true },
  // 截图框能否拖动
  canMoveBox: { type: Boolean, default: true },
  // 图片根据截图框输出比例倍数
  enlarge: { type: Number, default: 1 }
})
const mVisiable = computed({
  get() {
    return props.visiable
  },
  set(val: boolean) {
    $emit('update:visiable', val)
  }
})

const cropperRef = ref<typeof VueCropper>()

async function handleSaveBlob() {
  if (!cropperRef.value) return
  try {
    const result = await new Promise((resolve, reject) => {
      if (props.type === 'blob') {
        cropperRef.value!.getCropBlob(resolve)
      } else {
        cropperRef.value!.getCropData(resolve)
      }
    })
    $emit('success', { result })
    return true
  } catch (error) {
    return false
  }
}
</script>

<template>
  <a-modal
    v-model:visible="mVisiable"
    simple
    modal-class="image-cropper-dialog"
    title="图片裁切"
    width="500px"
    unmount-on-close
    :modal-style="{ padding: '12px' }"
    :mask-closable="false"
    :on-before-ok="handleSaveBlob"
  >
    <div class="cut">
      <vue-cropper
        ref="cropperRef"
        :img="image"
        :output-type="outputType"
        :can-scale="canScale"
        :can-move="canMove"
        :can-move-box="canMoveBox"
        :fixed="fixed"
        :fixed-number="fixedNumber"
        :fixed-box="fixedBox"
        :mode="mode"
        :auto-crop="autoCrop"
        :auto-crop-width="autoCropWidth"
        :auto-crop-height="autoCropHeight"
        :full="full"
        :center-box="centerBox"
        :info-true="infoTrue"
        :enlarge="enlarge"
      >
      </vue-cropper>
    </div>
  </a-modal>
</template>

<style lang="scss">
.image-cropper-dialog {
  .cut {
    width: 420px;
    height: 480px;
    margin: 0 auto 5px;
  }

  &.arco-modal-simple .arco-modal-footer {
    margin-top: 12px;
  }
}
</style>

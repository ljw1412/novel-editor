import { defineStore } from 'pinia'

export const useDialogStore = defineStore('dialogStore', {
  state: () => ({
    cropper: {
      isDisplay: false,
      image: '',
      //? 其它暂存数据
      data: {} as Record<string, any>,
      //? 具体参考ImageCropperDialog组件
      options: {} as Record<string, any>,
      defaultOptions: {
        mode: 'cover',
        type: 'base64',
        fixed: true,
        fixedBox: true,
        centerBox: true,
        fixedNumber: [1, 1],
        autoCropWidth: 200,
        autoCropHeight: 200
      },
      callback: (data: { result: string }) => {}
    }
  }),

  getters: {
    cropperOptions(state): Record<string, any> {
      return Object.assign(
        {},
        state.cropper.defaultOptions,
        state.cropper.options
      )
    }
  },

  actions: {}
})

import { Notification } from '@arco-design/web-vue'
import { defineStore } from 'pinia'
import { useEditorStore } from '.'

export const useDialogStore = defineStore('dialogStore', {
  state: () => ({
    // 数据初始化弹窗
    init: {
      isDisplay: false,
      message: ''
    },
    // 图片裁切弹窗
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
    },
    // 关键词抽屉弹窗
    keyword: {
      isDisplay: false,
      title: '',
      content: ''
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

  actions: {
    initDialog(show: boolean, message?: string) {
      this.init.isDisplay = show
      if (message) {
        this.init.message = message
      }
    },

    keywordDialog(show: boolean, data?: { key: string; title: string }) {
      if (show) {
        const { key = '', title = '' } = data || {}
        if (!key) return
        const keyword = useEditorStore()
          .getWorldPaneData('keywords')
          .find((item) => item.id === key)
        if (!keyword) {
          return Notification.error({
            title: `无效关键词`,
            content: `未找到关键词“${title}”…`,
            position: 'bottomRight',
            duration: 3 * 1000,
            closable: true
          })
        }
        this.keyword.title = keyword.title
        this.keyword.content = keyword.content
      }
      this.keyword.isDisplay = show
    }
  }
})

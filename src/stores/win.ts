import { defineStore } from 'pinia'
import { Modal } from '@arco-design/web-vue'
import $API from '/@/apis'

export const useWinStore = defineStore('winStore', {
  state: () => ({
    maximize: false
  }),
  actions: {
    updateMaximize(maximize: boolean) {
      this.maximize = maximize || false
    },

    async minimize() {
      return $API.Electron.win.control('minimize')
    },

    async toggleMaximize() {
      this.maximize = await $API.Electron.win.control('toggleMaximize')
    },

    async beforeClose() {
      const qualifiedName = 'app-will-close'
      document.body.setAttribute(qualifiedName, 'true')
      Modal.confirm({
        title: '即将关闭',
        content: '您保存过了吗？真的要离开了吗？',
        maskClosable: false,
        modalStyle: { 'text-align': 'center' },
        onOk: () => {
          this.close('main')
        },
        onCancel: () => {
          document.body.removeAttribute(qualifiedName)
        }
      })
    },

    async close(who = 'child') {
      return $API.Electron.win.control('close', who)
    }
  }
})

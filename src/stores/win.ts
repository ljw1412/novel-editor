import { defineStore } from 'pinia'
import { Modal } from '@arco-design/web-vue'
import { ipcInvoke } from '/@/utils/electron'

export const useWinStore = defineStore('winStore', {
  state: () => ({
    maximize: false
  }),
  actions: {
    updateMaximize(maximize: boolean) {
      this.maximize = maximize || false
    },

    async minimize() {
      await ipcInvoke('window', 'minimize')
    },

    async toggleMaximize() {
      const maximize = await ipcInvoke('window', 'toggleMaximize')
      this.maximize = maximize
    },

    async beforeClose() {
      const qualifiedName = 'app-will-close'
      document.body.setAttribute(qualifiedName, 'true')
      Modal.confirm({
        title: '即将关闭',
        content: '您保存过了吗？真的要离开了吗？',
        maskClosable: false,
        modalStyle: { 'text-align': 'center' },
        onOk: this.close,
        onCancel: () => {
          document.body.removeAttribute(qualifiedName)
        }
      })
    },

    async close() {
      await ipcInvoke('window', 'close')
    }
  }
})

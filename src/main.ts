import { createApp, watch } from 'vue'
import App from './App.vue'
import router from '/@/router'
import { createPinia } from 'pinia'
import ArcoVue, { Notification, Modal } from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import { useWinStore, useConfigStore } from '/@/stores'
import { ipcOn } from '/@/utils/ipc'

import '@arco-design/web-vue/dist/arco.css'
import '/@/styles/index.scss'

const app = createApp(App)

Notification._context = app._context
Modal._context = app._context

app
  .use(createPinia())
  .use(ArcoVue)
  .use(ArcoVueIcon)
  .use(router)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })

// 窗体事件监听
ipcOn('window', (e, action, data) => {
  const winStore = useWinStore()
  if (action === 'maximize') {
    winStore.updateMaximize(true)
  } else if (action === 'unmaximize') {
    winStore.updateMaximize(false)
  }
})

// 主题监听
const configStore = useConfigStore()
configStore.flushBodyTheme()
watch(
  () => configStore.theme.now,
  () => {
    configStore.flushBodyTheme()
  }
)

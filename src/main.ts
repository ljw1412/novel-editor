import { createApp } from 'vue'
import App from './App.vue'
import router from '/@/router'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import { useWinStore } from '/@/stores/win'
import { useConfigStore } from '/@/stores/config'
import { ipcOn } from '/@/utils/electron'

import '@arco-design/web-vue/dist/arco.css'
import '/@/styles/index.scss'

const app = createApp(App)
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

useConfigStore().flushBodyTheme()

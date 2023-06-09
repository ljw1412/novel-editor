import { createApp, watch } from 'vue'
import App from './App.vue'
import router from '/@/router'
import { createPinia } from 'pinia'
import { useWinStore, useConfigStore } from '/@/stores'
import { ipcOn } from '/@/utils/ipc'
import inject from './inject'

import '/@/styles/index.scss'

const app = createApp(App)

app
  .use(createPinia())
  .use(inject)
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

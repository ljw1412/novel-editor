import type { App } from 'vue'
import ArcoVue, { Notification, Modal } from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import { hyphenate } from '/@/utils/string'

import AppCloseBtn from '/@/components/AppCloseBtn.vue'
import AcgRatioDiv from '/@/components/AcgRatioDiv.vue'

const components = [AppCloseBtn, AcgRatioDiv]

import '@arco-design/web-vue/dist/arco.css'

export default {
  install: function (app: App) {
    // 组件库
    app.use(ArcoVue).use(ArcoVueIcon)
    Notification._context = app._context
    Modal._context = app._context
    // 自定义全局组件
    components.forEach((component) => {
      app.component(component.name, component)
    })
  }
}

import { createRouter, createWebHashHistory } from 'vue-router'
import * as logger from '/@/utils/logger'

import ContainerMain from '/@/containers/Main.vue'
import ContainerSeparate from '/@/containers/Separate.vue'
import AppHome from '/@/pages/Home/index.vue'
import AppHomeWelcome from '/@/pages/Home/Welcome.vue'
import AppHomeCreate from '/@/pages/Home/Create.vue'
import AppHomeOpener from '/@/pages/Home/Opener.vue'
import AppEditor from '/@/pages/Editor/index.vue'
import AppSetting from '/@/pages/Setting/index.vue'

const routes = [
  { path: '/', redirect: { name: 'AppHomeWelcome' } },
  {
    path: '/main',
    name: 'AppMain',
    component: ContainerMain,
    redirect: { name: 'AppHomeWelcome' },
    children: [
      {
        path: 'home',
        name: 'AppHome',
        component: AppHome,
        redirect: { name: 'AppHomeWelcome' },
        children: [
          {
            path: 'welcome',
            name: 'AppHomeWelcome',
            component: AppHomeWelcome,
            meta: { title: '欢迎' }
          },
          {
            path: 'create',
            name: 'AppHomeCreate',
            component: AppHomeCreate,
            meta: { title: '创建项目' }
          },
          {
            path: 'open',
            name: 'AppHomeOpener',
            component: AppHomeOpener,
            meta: { title: '打开项目' }
          }
        ]
      },
      { path: 'edit', name: 'AppEditor', component: AppEditor }
    ],
    meta: { module: 'main' }
  },
  // 内置浏览器
  {
    path: '/browser',
    name: 'AppBuiltInBrowser',
    component: ContainerSeparate,
    meta: { separate: true, isWebView: true }
  },
  // 带标题栏的独立页面
  {
    path: '/view',
    name: 'AppView',
    component: ContainerSeparate,
    meta: { separate: true },
    children: [
      {
        path: '/setting',
        name: 'AppSetting',
        component: AppSetting,
        meta: {
          title: '首选项',
          minimizable: false,
          hideIcon: true,
          maximizable: false
        }
      }
    ]
  }
]

const router = createRouter({
  routes,
  history: createWebHashHistory()
})

window.$router = router
export default router

router.beforeEach((to, from, next) => {
  next()
})

if (import.meta.env.MODE === 'development') {
  router.afterEach((to, from) => {
    const tofrom = [
      ['[To]', to],
      ['[From]', from]
    ]
    logger.message('CurrentRoute', window.location.href, ...tofrom)
  })
}

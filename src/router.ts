import { createRouter, createWebHashHistory } from 'vue-router'
import * as logger from '/@/utils/logger'

import ContainerMain from '/@/containers/Main.vue'
import ContainerSeparate from '/@/containers/Separate.vue'
import AppHome from '/@/pages/Home/index.vue'
import HomeWelcome from '/@/pages/Home/Welcome.vue'
import HomeCreate from '/@/pages/Home/Create.vue'
import HomeOpener from '/@/pages/Home/Opener.vue'
import AppEditor from '/@/pages/Editor/index.vue'
import EditorSidebarBookshelf from '/@/pages/Editor/Sidebar/Bookshelf.vue'
import EditorBookshelf from '/@/pages/Editor/Content/Bookshelf.vue'
import EditorSidebarCharacter from '/@/pages/Editor/Sidebar/Character.vue'
import EditorCharacter from '/@/pages/Editor/Content/Character.vue'
import EditorSidebarWorld from '/@/pages/Editor/Sidebar/World.vue'
import EditorWorld from '/@/pages/Editor/Content/World.vue'
import EditorSidebarInfo from '/@/pages/Editor/Sidebar/Info.vue'
import EditorInfo from '/@/pages/Editor/Content/Info.vue'
import AppSetting from '/@/pages/Setting/index.vue'

const routes = [
  { path: '/', redirect: { name: 'HomeWelcome' } },
  {
    path: '/main',
    name: 'AppMain',
    component: ContainerMain,
    redirect: { name: 'HomeWelcome' },
    children: [
      {
        path: 'home',
        name: 'AppHome',
        component: AppHome,
        redirect: { name: 'HomeWelcome' },
        children: [
          {
            path: 'welcome',
            name: 'HomeWelcome',
            component: HomeWelcome,
            meta: { title: '欢迎' }
          },
          {
            path: 'create',
            name: 'HomeCreate',
            component: HomeCreate,
            meta: { title: '创建项目' }
          },
          {
            path: 'open',
            name: 'HomeOpener',
            component: HomeOpener,
            meta: { title: '打开项目' }
          }
        ]
      },
      {
        path: 'edit',
        name: 'AppEditor',
        component: AppEditor,
        children: [
          {
            path: 'bookshelf',
            name: 'EditorBookshelf',
            components: {
              sidebar: EditorSidebarBookshelf,
              default: EditorBookshelf
            },
            meta: { title: '小说' }
          },
          {
            path: 'character',
            name: 'EditorCharacter',
            components: {
              sidebar: EditorSidebarCharacter,
              default: EditorCharacter
            },
            meta: { title: '角色' }
          },
          {
            path: 'world',
            name: 'EditorWorld',
            components: {
              sidebar: EditorSidebarWorld,
              default: EditorWorld
            },
            meta: { title: '世界观' }
          },
          {
            path: 'info',
            name: 'EditorInfo',
            components: {
              sidebar: EditorSidebarInfo,
              default: EditorInfo
            },
            meta: { title: '信息' }
          }
        ]
      }
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

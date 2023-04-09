import { createRouter, createWebHashHistory } from 'vue-router'
import * as logger from '/@/utils/logger'

import ContainerMain from '/@/containers/Main.vue'
import ContainerSeparate from '/@/containers/Separate.vue'
import AppHome from '/@/pages/Home/index.vue'
import HomeWelcome from '/@/pages/Home/Welcome.vue'
import HomeCreate from '/@/pages/Home/Create.vue'
import HomeOpener from '/@/pages/Home/Opener.vue'
import AppEditor from '/@/pages/Editor/index.vue'
import EmptyContent from '/@/pages/Editor/Content/Empty.vue'
import BookshelfSidebar from '/@/pages/Editor/Sidebar/Bookshelf.vue'
import BookshelfContent from '/@/pages/Editor/Content/Bookshelf.vue'
import CharacterSidebar from '/@/pages/Editor/Sidebar/Character.vue'
import CharacterContent from '/@/pages/Editor/Content/Character.vue'
import WorldSidebar from '/@/pages/Editor/Sidebar/World.vue'
import WorldContent from '/@/pages/Editor/Content/World.vue'
import WorldTimeline from './pages/Editor/Content/World/Timeline.vue'
import InfoSidebar from '/@/pages/Editor/Sidebar/Info.vue'
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
              sidebar: BookshelfSidebar,
              default: BookshelfContent
            },
            meta: { title: '小说' }
          },
          {
            path: 'world',
            name: 'EditorWorld',
            components: {
              sidebar: WorldSidebar,
              default: EmptyContent
            },
            meta: { title: '世界观' }
          },
          {
            path: 'world/summary',
            name: 'WorldSummary',
            components: {
              sidebar: WorldSidebar,
              // TODO: 可能要独立页面
              default: WorldContent
            },
            meta: { title: '世界观', subtitle: '简介' }
          },
          {
            path: 'world/timeline',
            name: 'WorldTimeline',
            components: {
              sidebar: WorldSidebar,
              default: WorldTimeline
            },
            meta: { title: '世界观', subtitle: '时间线' }
          },
          {
            path: 'world/keywords',
            name: 'WorldKeywords',
            components: {
              sidebar: WorldSidebar,
              // TODO: 可能要独立页面
              default: WorldContent
            },
            meta: { title: '世界观', subtitle: '关键词' }
          },
          {
            path: 'character',
            name: 'EditorCharacter',
            components: {
              sidebar: CharacterSidebar,
              default: CharacterContent
            },
            meta: { title: '角色' }
          },
          {
            path: 'info',
            name: 'EditorInfo',
            components: {
              sidebar: InfoSidebar,
              default: EmptyContent
            },
            meta: { title: '基础信息' }
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

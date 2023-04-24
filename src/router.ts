import { createRouter, createWebHashHistory } from 'vue-router'
import * as logger from '/@/utils/logger'
import { useProjectStore } from '/@/stores'

import ContainerMain from '/@/containers/Main.vue'
import ContainerSeparate from '/@/containers/Separate.vue'
import AppHome from '/@/pages/Home/index.vue'
import HomeWelcome from '/@/pages/Home/Welcome.vue'
import HomeCreate from '/@/pages/Home/Create.vue'
import HomeOpener from '/@/pages/Home/Opener.vue'
import AppEditor from '/@/pages/Editor/index.vue'
import EmptyContent from '/@/pages/Editor/Content/Empty.vue'
import BookshelfSidebar from '/@/pages/Editor/Sidebar/Bookshelf.vue'
import BookshelfContent from '/@/pages/Editor/Content/Bookshelf/Bookshelf.vue'
import CharacterSidebar from '/@/pages/Editor/Sidebar/Character.vue'
import CharacterEditor from '/@/pages/Editor/Content/Character/Editor.vue'
import CharacterRelationships from '/@/pages/Editor/Content/Character/Relationships.vue'
import WorldSidebar from '/@/pages/Editor/Sidebar/World.vue'
import WorldCommon from '/@/pages/Editor/Content/World/Common.vue'
import WorldTimeline from '/@/pages/Editor/Content/World/Timeline.vue'
import InfoSidebar from '/@/pages/Editor/Sidebar/Info.vue'
import EditorInfo from '/@/pages/Editor/Content/Info/Info.vue'
import EditorSetting from '/@/pages/Editor/Content/Setting/index.vue'
import SettingRegular from '/@/pages/Editor/Content/Setting/Regular.vue'
import SettingInterface from '/@/pages/Editor/Content/Setting/Interface.vue'
import SettingAbout from '/@/pages/Editor/Content/Setting/About.vue'

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
          // 小说
          {
            path: 'bookshelf',
            name: 'EditorBookshelf',
            components: {
              sidebar: BookshelfSidebar,
              default: EmptyContent
            },
            meta: { title: '小说' }
          },
          // 世界观
          {
            path: 'world',
            name: 'EditorWorld',
            components: {
              sidebar: WorldSidebar,
              default: EmptyContent
            },
            meta: { title: '世界观' }
          },
          // 世界观 - 简介
          {
            path: 'world/summary',
            name: 'WorldSummary',
            components: {
              sidebar: WorldSidebar,
              // TODO: 可能要独立页面
              default: WorldCommon
            },
            meta: {
              title: '世界观',
              subtitle: '简介',
              action: 'world',
              key: 'summary'
            }
          },
          // 世界观 - 时间线
          {
            path: 'world/timeline',
            name: 'WorldTimeline',
            components: {
              sidebar: WorldSidebar,
              default: WorldTimeline
            },
            meta: {
              title: '世界观',
              subtitle: '时间线',
              action: 'world',
              key: 'timeline'
            }
          },
          // 世界观 - 关键词
          {
            path: 'world/keywords',
            name: 'WorldKeywords',
            components: {
              sidebar: WorldSidebar,
              // TODO: 可能要独立页面
              default: WorldCommon
            },
            meta: {
              title: '世界观',
              subtitle: '关键词',
              action: 'world',
              key: 'keywords'
            }
          },
          // 人物
          {
            path: 'character',
            name: 'EditorCharacter',
            components: {
              sidebar: CharacterSidebar,
              default: EmptyContent
            },
            meta: { title: '人物' }
          },
          // 人物 - 关系图
          {
            path: 'character/relationships',
            name: 'CharacterRelationships',
            components: {
              sidebar: CharacterSidebar,
              default: CharacterRelationships
            },
            meta: {
              title: '人物',
              subtitle: '关系图',
              action: 'character',
              full: true
            }
          },
          // 人物 - 编辑器
          {
            path: 'character/editor',
            name: 'CharacterEditor',
            components: {
              sidebar: CharacterSidebar,
              default: CharacterEditor
            },
            meta: { title: '人物', action: 'character' }
          },
          // 项目信息
          {
            path: 'info',
            name: 'EditorInfo',
            components: {
              sidebar: InfoSidebar,
              default: EmptyContent
            },
            meta: { title: '项目' }
          },
          {
            path: 'setting',
            name: 'EditorSetting',
            component: EditorSetting,
            meta: { title: '设置', hideSidebar: true, reflush: false },
            children: [
              {
                path: 'regular',
                name: 'SettingRegular',
                component: SettingRegular,
                meta: { title: '常规' }
              },
              {
                path: 'interface',
                name: 'SettingInterface',
                component: SettingInterface,
                meta: { title: '界面' }
              },
              {
                path: 'about',
                name: 'SettingAbout',
                component: SettingAbout,
                meta: { title: '关于' }
              }
            ]
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
  //? 带标题栏的独立页面
  {
    path: '/view',
    name: 'AppView',
    component: ContainerSeparate,
    meta: { separate: true },
    children: [
      {
        path: 'about',
        name: 'AppAbout',
        component: SettingAbout,
        meta: {
          title: '关于',
          minimizable: false,
          hideIcon: true,
          maximizable: false
        }
      }
    ]
  },
  //? 自定义标题栏的独立界面
  // 设置页面
  {
    path: '/setting',
    name: 'AppSetting',
    component: AppSetting,
    meta: {
      title: '设置',
      minimizable: false,
      hideIcon: true,
      maximizable: false
    },
    children: [
      {
        path: 'regular',
        name: 'AppSettingRegular',
        component: SettingRegular,
        meta: { title: '常规' }
      },
      {
        path: 'interface',
        name: 'AppSettingInterface',
        component: SettingInterface,
        meta: { title: '界面' }
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
  const projectStore = useProjectStore()
  // 项目未加载，却进入编辑页面
  if (
    !projectStore.isProjectLoaded &&
    to.matched.some((item) => item.name === 'AppEditor')
  ) {
    return next({ name: 'HomeWelcome', replace: true })
  }

  if (to.fullPath === from.fullPath) {
    return next(false)
  }

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

import { createRouter, createWebHashHistory } from 'vue-router'

import AppMain from '/@/containers/Main.vue'
import AppHome from '/@/pages/Home/index.vue'

const routes = [
  { path: '/', redirect: { name: 'AppHome' } },
  {
    path: '/main',
    name: 'AppMain',
    component: AppMain,
    redirect: { name: 'AppHome' },
    children: [{ path: 'home', name: 'AppHome', component: AppHome }],
    meta: { module: 'main' }
  }
]

const router = createRouter({
  routes,
  history: createWebHashHistory()
})

export default router

if (import.meta.env.MODE === 'development') {
  router.afterEach((to, from) => {
    const tofrom = ['[To]', to, '\n[From]', from]
    console.groupCollapsed(
      '%c[CurrentRoute]',
      'color: #168cff;',
      window.location.href
    )
    console.log(...tofrom)
    console.groupEnd()
  })
}

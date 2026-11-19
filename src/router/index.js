import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import InventoryReport from '../views/InventoryReport.vue'
import ExternalDemo from '../views/ExternalDemo.vue'
import SalesDetail from '../views/SalesDetail.vue'
import SalesDetail2 from '../views/SalesDetail2.vue'
import SalesDetail3 from '../views/SalesDetail3.vue'
import SalesDetail4 from '../views/SalesDetail4.vue'
import CockpitView from '../views/CockpitView.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  // 驾驶舱三个入口：集团 / 超市 / 百购。目前共用同一个大屏页，
  // 用路由 meta.scope 区分（后续各业态单独取数时再拆页面）。
  // ⚠️ 路径不能叫 /cockpit —— 根目录有 cockpit.html，Vite 会把 /cockpit 直接解析成
  //    那个静态页，绕开 vue-router，导致后台框架（左侧菜单）整块不显示。
  { path: '/dashboard', name: 'Cockpit', component: CockpitView, meta: { requiresAuth: true, scope: 'group' } },
  { path: '/dashboard-supermarket', name: 'CockpitSupermarket', component: CockpitView, meta: { requiresAuth: true, scope: 'supermarket' } },
  { path: '/dashboard-mall', name: 'CockpitMall', component: CockpitView, meta: { requiresAuth: true, scope: 'mall' } },
  { path: '/home', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/report', name: 'InventoryReport', component: InventoryReport, meta: { requiresAuth: true } },
  { path: '/external', name: 'ExternalDemo', component: ExternalDemo, meta: { requiresAuth: true } },
  { path: '/sales-detail', name: 'SalesDetail', component: SalesDetail, meta: { requiresAuth: true } },
  { path: '/sales-detail2', name: 'SalesDetail2', component: SalesDetail2, meta: { requiresAuth: true } },
  { path: '/sales-detail3', name: 'SalesDetail3', component: SalesDetail3, meta: { requiresAuth: true } },
  { path: '/sales-detail4', name: 'SalesDetail4', component: SalesDetail4, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/home')
  } else {
    next()
  }
})

export default router

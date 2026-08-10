import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import InventoryReport from '../views/InventoryReport.vue'
import ExternalDemo from '../views/ExternalDemo.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/home', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/report', name: 'InventoryReport', component: InventoryReport, meta: { requiresAuth: true } },
  { path: '/external', name: 'ExternalDemo', component: ExternalDemo, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const isLogin = localStorage.getItem('isLogin') === 'true'
  if (to.meta.requiresAuth && !isLogin) {
    next('/login')
  } else if (to.path === '/login' && isLogin) {
    next('/home')
  } else {
    next()
  }
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import InventoryReport from '../views/InventoryReport.vue'
import ExternalDemo from '../views/ExternalDemo.vue'
import SalesDetail from '../views/SalesDetail.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/home', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/report', name: 'InventoryReport', component: InventoryReport, meta: { requiresAuth: true } },
  { path: '/external', name: 'ExternalDemo', component: ExternalDemo, meta: { requiresAuth: true } },
  { path: '/sales-detail', name: 'SalesDetail', component: SalesDetail, meta: { requiresAuth: true } },
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

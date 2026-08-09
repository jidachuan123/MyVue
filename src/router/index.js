import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import InventoryReport from '../views/InventoryReport.vue'
import ExternalDemo from '../views/ExternalDemo.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/report', name: 'InventoryReport', component: InventoryReport },
  { path: '/external', name: 'ExternalDemo', component: ExternalDemo },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

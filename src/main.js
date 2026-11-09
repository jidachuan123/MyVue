import { createApp } from 'vue'
import {
  ElMenu, ElSubMenu, ElMenuItem, ElScrollbar, ElIcon,
  ElBreadcrumb, ElBreadcrumbItem, ElButton, ElTooltip, ElConfigProvider
} from 'element-plus'
// 只引入用到的组件样式（按需），避免全量 css 撑大产物
import 'element-plus/theme-chalk/base.css'
import 'element-plus/theme-chalk/el-menu.css'
import 'element-plus/theme-chalk/el-sub-menu.css'
import 'element-plus/theme-chalk/el-menu-item.css'
import 'element-plus/theme-chalk/el-scrollbar.css'
import 'element-plus/theme-chalk/el-icon.css'
import 'element-plus/theme-chalk/el-breadcrumb.css'
import 'element-plus/theme-chalk/el-breadcrumb-item.css'
import 'element-plus/theme-chalk/el-button.css'
import 'element-plus/theme-chalk/el-tooltip.css'
import App from './App.vue'
import router from './router'

// ============================================================
// 2026-11-09：主界面改为「左侧树导航」，按需引入 Element Plus 组件
//   只注册侧栏菜单 / 面包屑 / 提示用到的 10 个组件
//   中文语言包在 App.vue 里用 el-config-provider 注入
// ============================================================
const app = createApp(App)
app.use(router)

const components = [
  ElConfigProvider, ElMenu, ElSubMenu, ElMenuItem, ElScrollbar,
  ElIcon, ElBreadcrumb, ElBreadcrumbItem, ElButton, ElTooltip
]
components.forEach((c) => app.component(c.name, c))

app.mount('#app')

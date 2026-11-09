<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {
  Odometer, TrendCharts, Box, DataAnalysis, Goods,
  Setting, Connection, Fold, Expand, SwitchButton, UserFilled
} from '@element-plus/icons-vue'
import request from './utils/request'

const route = useRoute()
const router = useRouter()

// 登录页不套后台框架（保持原来的居中卡片 + 渐变背景）
const isLoginPage = computed(() => route.path === '/login')

// ============================================================
// 2026-11-09：主界面由「顶部横向导航」改为「左侧树导航」
//   一级三分组：报表 / 数据 / 系统；报表下再分销售报表、库存报表
// ============================================================
const menuGroups = [
  {
    key: 'report',
    title: '报表',
    icon: Odometer,
    children: [
      {
        key: 'report-sales',
        title: '销售报表',
        icon: TrendCharts,
        children: [
          { key: '/sales-detail', title: '销售详情1' },
          { key: '/sales-detail2', title: '销售详情2' },
          { key: '/sales-detail3', title: '销售详情3' },
          { key: '/sales-detail4', title: '销售详情4' },
        ],
      },
      {
        key: 'report-stock',
        title: '库存报表',
        icon: Box,
        children: [{ key: '/report', title: '盘点报表' }],
      },
    ],
  },
  {
    key: 'data',
    title: '数据',
    icon: DataAnalysis,
    children: [{ key: '/home', title: '商品列表', icon: Goods }],
  },
  {
    key: 'system',
    title: '系统',
    icon: Setting,
    children: [{ key: '/external', title: '外部对接', icon: Connection }],
  },
]

// 当前选中项 = 当前路由
const activeMenu = computed(() => route.path)
// 默认展开全部分组
const defaultOpeneds = ['report', 'report-sales', 'report-stock', 'data', 'system']

// 面包屑：按当前路由在菜单树中的路径还原
const breadcrumb = computed(() => {
  const trail = []
  const walk = (nodes, path) => {
    for (const n of nodes) {
      const p = [...path, n.title]
      if (n.children && n.children.length) {
        if (walk(n.children, p)) return true
      } else if (n.key === route.path) {
        trail.push(...p)
        return true
      }
    }
    return false
  }
  walk(menuGroups, [])
  return trail
})

// 侧栏折叠状态（记住用户选择；localStorage 不可用时静默忽略）
const collapsed = ref(readCollapsed())
function readCollapsed() {
  try { return localStorage.getItem('sidebar-collapsed') === '1' } catch (e) { return false }
}
watch(collapsed, (v) => {
  try { localStorage.setItem('sidebar-collapsed', v ? '1' : '0') } catch (e) { /* ignore */ }
})

const userName = computed(() => {
  try { return localStorage.getItem('realName') || localStorage.getItem('username') || '管理员' } catch (e) { return '管理员' }
})

const logout = () => {
  request.removeToken()
  router.push('/login')
}
</script>

<template>
  <el-config-provider :locale="zhCn">
  <!-- 登录页：保持整屏渐变 + 居中卡片 -->
  <div v-if="isLoginPage" class="login-wrap">
    <router-view />
  </div>

  <!-- 后台主界面：左侧树 + 右侧内容 -->
  <div v-else class="app-shell">
    <aside class="app-sidebar" :class="{ collapsed }">
      <div class="brand">
        <div class="brand-logo">SC</div>
        <div v-show="!collapsed" class="brand-text">
          <h1>Spring Cloud</h1>
          <p>架构管理系统</p>
        </div>
      </div>

      <el-scrollbar class="menu-scroll">
        <el-menu
          :default-active="activeMenu"
          :default-openeds="defaultOpeneds"
          :collapse="collapsed"
          :collapse-transition="false"
          router
          class="side-menu"
        >
          <el-sub-menu v-for="g in menuGroups" :key="g.key" :index="g.key">
            <template #title>
              <el-icon><component :is="g.icon" /></el-icon>
              <span>{{ g.title }}</span>
            </template>

            <template v-for="c in g.children" :key="c.key">
              <!-- 有下级的二级分组（销售报表 / 库存报表） -->
              <el-sub-menu v-if="c.children" :index="c.key">
                <template #title>
                  <el-icon><component :is="c.icon" /></el-icon>
                  <span>{{ c.title }}</span>
                </template>
                <el-menu-item v-for="leaf in c.children" :key="leaf.key" :index="leaf.key">
                  <span>{{ leaf.title }}</span>
                </el-menu-item>
              </el-sub-menu>

              <!-- 直接跳转的叶子项 -->
              <el-menu-item v-else :index="c.key">
                <el-icon v-if="c.icon"><component :is="c.icon" /></el-icon>
                <span>{{ c.title }}</span>
              </el-menu-item>
            </template>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>

      <div class="sidebar-footer">
        <el-tooltip content="退出登录" placement="top" :disabled="!collapsed">
          <div class="logout" @click="logout">
            <el-icon><SwitchButton /></el-icon>
            <span v-show="!collapsed">退出登录</span>
          </div>
        </el-tooltip>
      </div>
    </aside>

    <div class="app-body">
      <header class="app-topbar">
        <el-button text class="collapse-btn" @click="collapsed = !collapsed">
          <el-icon :size="18"><component :is="collapsed ? Expand : Fold" /></el-icon>
        </el-button>

        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="(t, i) in breadcrumb" :key="i">{{ t }}</el-breadcrumb-item>
        </el-breadcrumb>

        <div class="topbar-right">
          <el-icon class="user-icon"><UserFilled /></el-icon>
          <span class="user-name">{{ userName }}</span>
        </div>
      </header>

      <main class="app-content">
        <router-view />
      </main>
    </div>
  </div>
  </el-config-provider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  /* 2026-11-09：后台改版后内容区改浅灰底；渐变背景只在登录页使用 */
  background: #f5f7fa;
  min-height: 100vh;
}

/* ---------- 登录页（沿用原渐变） ---------- */
.login-wrap {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* ---------- 整体骨架 ---------- */
.app-shell {
  display: flex;
  min-height: 100vh;
}

/* ---------- 左侧树 ---------- */
.app-sidebar {
  width: 220px;
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #4c43a8 0%, #3a3480 100%);
  transition: width .22s ease, flex-basis .22s ease;
  overflow: hidden;
}
.app-sidebar.collapsed {
  width: 64px;
  flex-basis: 64px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  white-space: nowrap;
}
.brand-logo {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border-radius: 9px;
  background: linear-gradient(135deg, #8b7cf6, #667eea);
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: .5px;
}
.brand-text h1 {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  letter-spacing: .3px;
}
.brand-text p {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.menu-scroll {
  flex: 1;
  padding: 8px 0;
}

/* Element Plus 菜单在深色侧栏上的配色覆盖 */
.side-menu.el-menu {
  border-right: none;
  background: transparent;
}
.side-menu .el-menu-item,
.side-menu .el-sub-menu__title {
  color: rgba(255, 255, 255, 0.78);
  height: 44px;
  line-height: 44px;
  font-size: 13px;
}
/* 缩进让树层级更清晰 */
.side-menu .el-sub-menu .el-sub-menu__title {
  padding-left: 34px !important;
}
.side-menu .el-sub-menu .el-sub-menu .el-menu-item {
  padding-left: 62px !important;
  height: 40px;
  line-height: 40px;
}
.side-menu .el-sub-menu .el-menu-item {
  padding-left: 46px !important;
  height: 40px;
  line-height: 40px;
}
.side-menu .el-menu-item:hover,
.side-menu .el-sub-menu__title:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #fff;
}
.side-menu .el-menu-item.is-active {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  font-weight: 600;
  border-right: 3px solid #a99bff;
}
.side-menu .el-sub-menu.is-active > .el-sub-menu__title {
  color: #fff;
}
.side-menu .el-sub-menu .el-menu {
  background: rgba(0, 0, 0, 0.12);
}
.side-menu .el-icon {
  margin-right: 8px;
}

.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding: 8px;
}
.logout {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  padding: 9px 10px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  cursor: pointer;
  transition: background .18s;
}
.logout:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

/* ---------- 右侧 ---------- */
.app-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.app-topbar {
  height: 54px;
  flex: 0 0 54px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px 0 10px;
  background: #fff;
  border-bottom: 1px solid #e8ecf3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.collapse-btn {
  color: #5a6377;
  padding: 6px;
}
.topbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #5a6377;
  font-size: 13px;
}
.user-icon {
  color: #8b7cf6;
}

.app-content {
  flex: 1;
  min-width: 0;
  padding: 18px;
  overflow: auto;
}
</style>

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * 经营驾驶舱（3004）专用 vite 配置
 *
 * 为什么单独一份配置：
 *   - 3001 的页面是一个正常的管理后台（index.html + vue-router 多页签）；
 *   - 3004 驾驶舱是大屏，独立入口（cockpit.html）、独立样式、按 1920×1080 整体缩放，
 *     不适合塞进 3001 的路由里（会被后台布局的侧边栏/滚动条干扰）；
 *   - 但代码仍然放在同一个 MyVue 工程内（src/cockpit/**），依赖、构建工具、代理规则全部复用。
 *
 * 用法：
 *   npm run dev:cockpit     → http://localhost:3004
 *   npm run build:cockpit   → 产物 dist-cockpit/
 *
 * 注意：本机环境的安全删除插件会拦截「一次删 50+ 个文件」，vite 默认构建前清空 dist 会失败，
 *      所以 emptyOutDir 关掉（产物带 hash，不会互相覆盖；要清理就手工删 dist-cockpit）。
 */

/** 让 http://localhost:3004/ 直接落到 cockpit.html（否则根路径会返回 3001 的 index.html） */
const serveCockpitAtRoot = () => ({
  name: 'cockpit-root-entry',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/' || req.url.startsWith('/?') || req.url === '/index.html') {
        const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
        req.url = '/cockpit.html' + qs
      }
      next()
    })
  }
})

const proxy = {
  // provider-service → 8001（驾驶舱数据接口 /provider/cockpit/**）
  '/api/provider': {
    target: 'http://localhost:8001',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  },
  // consumer-service → 8002（备用：以后大屏要登录态时用）
  '/api/consumer': {
    target: 'http://localhost:8002',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}

export default defineConfig({
  plugins: [vue(), serveCockpitAtRoot()],
  build: {
    outDir: 'dist-cockpit',
    emptyOutDir: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: 'cockpit.html'
    }
  },
  optimizeDeps: {
    // 只按驾驶舱入口预构建依赖，不要把 3001 的页面也拉进来
    entries: ['cockpit.html']
  },
  server: {
    // 0.0.0.0 让大屏/会议室机器可以用本机 IP 直接访问
    host: '0.0.0.0',
    port: 3004,
    strictPort: true,
    proxy
  },
  preview: {
    port: 4174,
    proxy
  }
})

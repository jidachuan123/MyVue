<template>
  <div ref="rootEl" class="cockpit-embed" :class="{ 'is-fullscreen': isFullscreen }">
    <!--
      驾驶舱是独立入口（cockpit.html + src/cockpit/**，自带 1920×1080 缩放和整屏深色样式），
      样式是全局的（会改 body 背景、overflow），直接挂进后台布局会把侧边栏和顶栏一起改掉，
      所以这里用 iframe 隔离，既保留大屏版式，也不影响后台框架。
    -->
    <iframe
      class="cockpit-frame"
      :src="iframeSrc"
      :key="iframeSrc"
      :title="title"
      frameborder="0"
      allowfullscreen
    ></iframe>

    <!-- 全屏按钮：点击后整块大屏铺满整个显示器（浏览器全屏 API，ESC 退出） -->
    <button
      class="cockpit-fs-btn"
      :title="isFullscreen ? '退出全屏（ESC）' : '全屏铺满'"
      @click="toggleFullscreen"
    >
      <svg v-if="!isFullscreen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3" />
        <path d="M16 3h3a2 2 0 0 1 2 2v3" />
        <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
        <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 3v3a2 2 0 0 1-2 2H3" />
        <path d="M16 3v3a2 2 0 0 0 2 2h3" />
        <path d="M8 21v-3a2 2 0 0 0-2-2H3" />
        <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
      </svg>
      <span>{{ isFullscreen ? '退出全屏' : '全屏' }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const rootEl = ref(null)

/**
 * 集团 / 超市 / 百购 三个入口目前共用同一张大屏页，
 * 用路由 meta.scope 区分，通过 query 传给 iframe，
 * 后续各业态单独取数时，cockpit 页只需按 scope 调不同接口即可。
 */
const TITLES = {
  group: '集团驾驶舱',
  supermarket: '超市驾驶舱',
  mall: '百购驾驶舱'
}

const scope = computed(() => route.meta.scope || 'group')
const title = computed(() => TITLES[scope.value] || '集团驾驶舱')
const iframeSrc = computed(() => `/cockpit.html?scope=${scope.value}`)

const isFullscreen = ref(false)

function syncFullscreen() {
  isFullscreen.value = !!document.fullscreenElement
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen?.()
    return
  }
  // 全屏外层容器而不是 iframe 本身：
  //   - iframe 全屏后父页面的「退出全屏」按钮会被盖住，用户只能用 ESC；
  //   - 全屏容器时 iframe 跟着变大，里面的大屏靠 resize 自动重新等比缩放。
  const el = rootEl.value
  if (!el) return
  el.requestFullscreen?.()
}

onMounted(() => {
  document.addEventListener('fullscreenchange', syncFullscreen)
  // 从浏览器直接 F11 进入全屏时也同步一下按钮状态
  window.addEventListener('resize', syncFullscreen)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', syncFullscreen)
  window.removeEventListener('resize', syncFullscreen)
})
</script>

<style scoped>
.cockpit-embed {
  position: relative;
  /* 内容区已去掉内边距（.app-content--flush），只需扣掉顶栏 55px(含 1px 下边框) */
  height: calc(100vh - 55px);
  min-height: 420px;
  overflow: hidden;
  background: #01060f;
}

/* 全屏时整块吃满屏幕 */
.cockpit-embed.is-fullscreen,
.cockpit-embed:fullscreen {
  width: 100vw;
  height: 100vh;
  min-height: 0;
  border-radius: 0;
  background: #01060f;
}

.cockpit-frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: #01060f;
}

/* 全屏按钮：右上角常显，鼠标移入加深 */
.cockpit-fs-btn {
  position: absolute;
  right: 12px;
  top: 12px;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 11px;
  border: 1px solid rgba(120, 190, 255, 0.45);
  border-radius: 6px;
  background: rgba(6, 22, 48, 0.82);
  color: #a9d3ff;
  font-size: 12px;
  letter-spacing: 0.5px;
  cursor: pointer;
  opacity: 0.78;
  backdrop-filter: blur(4px);
  transition: opacity 0.2s, color 0.2s, border-color 0.2s, background 0.2s;
}
.cockpit-fs-btn:hover {
  opacity: 1;
  color: #3fe3ff;
  border-color: rgba(63, 227, 255, 0.8);
  background: rgba(10, 40, 82, 0.95);
}
.cockpit-fs-btn svg { width: 14px; height: 14px; }

/* 全屏时按钮半透明，避免挡住大屏内容 */
.cockpit-embed.is-fullscreen .cockpit-fs-btn,
.cockpit-embed:fullscreen .cockpit-fs-btn {
  opacity: 0.35;
}
.cockpit-embed.is-fullscreen .cockpit-fs-btn:hover,
.cockpit-embed:fullscreen .cockpit-fs-btn:hover {
  opacity: 1;
}
</style>

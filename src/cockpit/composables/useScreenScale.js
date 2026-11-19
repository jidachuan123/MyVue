import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 大屏等比缩放（铺满模式）
 *
 * 设计稿固定宽度 1920，**按宽度等比缩放**，高度交给容器决定：
 *   scale  = 容器宽 / 1920
 *   canvasH = 容器高 / scale   ← 画布高度按容器"反算"，所以正好铺满不裁切
 *
 * 为什么不用 min(宽比, 高比) 居中留黑边：
 *   驾驶舱嵌在后台内容区里，容器比 16:9 更宽/更扁，用 min 会在左右（或上下）
 *   留出大片黑边，视觉上就是「没有铺满」。
 *   这里改成宽度对齐、高度自适应，中间那一行是 grid 的 1fr，会自动吸收多出来的高度。
 *
 * 注意：transform-origin 在 CSS 里是 center center，配合外层 flex 居中即可。
 */
export function useScreenScale(designW = 1920, designH = 1080) {
  const scale = ref(1)
  const canvasH = ref(designH)

  const update = () => {
    const sw = window.innerWidth || designW
    const sh = window.innerHeight || designH
    const s = sw / designW
    scale.value = s
    // 画布高度 = 视口高度 / 缩放比，保证缩放后正好等于视口高
    canvasH.value = Math.max(designH * 0.72, Math.min(designH * 1.6, sh / s))
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', update)
  })

  return { scale, canvasH, update }
}

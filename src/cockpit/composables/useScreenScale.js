import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 大屏等比缩放
 *
 * 设计稿固定 1920×1080，按窗口取 min(宽比, 高比) 整体 scale。
 * 好处：不管投到 1080p 显示器、4K 电视还是笔记本，版式永远不变形、不塌。
 * 注意：transform-origin 在 CSS 里是 center center，配合外层 flex 居中即可。
 */
export function useScreenScale(designW = 1920, designH = 1080) {
  const scale = ref(1)

  const update = () => {
    const sw = window.innerWidth || designW
    const sh = window.innerHeight || designH
    scale.value = Math.min(sw / designW, sh / designH)
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', update)
  })

  return { scale, update }
}

import { onBeforeUnmount, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

/**
 * ECharts 通用挂载逻辑（两个图表组件共用）
 *
 * @param {import('vue').Ref} elRef      容器 ref
 * @param {Function}          buildOption 返回 option 的函数（每次渲染都会重算）
 * @param {Function}          getData     取数据的 getter，变化即重绘（deep watch）
 */
export function useChart(elRef, buildOption, getData) {
  let chart = null
  let observer = null

  const render = () => {
    if (!chart) return
    const option = buildOption(getData())
    if (option) chart.setOption(option, true)
  }

  onMounted(() => {
    if (!elRef.value) return
    chart = echarts.init(elRef.value, null, { renderer: 'canvas' })
    render()
    // 大屏会响应窗口尺寸变化（外层 transform 缩放），图表按布局尺寸自适应
    observer = new ResizeObserver(() => chart && chart.resize())
    observer.observe(elRef.value)
  })

  watch(getData, render, { deep: true })

  onBeforeUnmount(() => {
    if (observer) observer.disconnect()
    if (chart) {
      chart.dispose()
      chart = null
    }
  })
}

/** 大屏统一样式常量（改这里即可统一两个图表的观感） */
export const CHART_STYLE = {
  text: '#8fb3dd',
  textDim: '#5f83b3',
  split: 'rgba(80, 140, 220, 0.13)',
  axis: 'rgba(90, 150, 220, 0.35)'
}

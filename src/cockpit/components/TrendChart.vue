<template>
  <div ref="el" class="chart-box"></div>
</template>

<script setup>
import { ref } from 'vue'
import * as echarts from 'echarts'
import { useChart, CHART_STYLE } from '../composables/useChart'

const props = defineProps({
  // [{ date:'11-04', amount:428.6 }]
  data: { type: Array, default: () => [] }
})

const el = ref(null)

useChart(el, buildOption, () => props.data)

function buildOption(list) {
  const rows = Array.isArray(list) ? list : []
  const dates = rows.map((r) => r.date)
  // 首点太靠左会压住 Y 轴刻度，直接不显示；末点向左偏移，避免超出右边界
  const values = rows.map((r, i) => {
    const label = {}
    if (i === 0) {
      label.show = false
    } else if (i === rows.length - 1) {
      label.position = 'left'
      label.distance = 10
    }
    return { value: Number(r.amount || 0), label }
  })

  return {
    animationDuration: 900,
    grid: { left: 66, right: 40, top: 34, bottom: 28 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(6,24,50,0.92)',
      borderColor: 'rgba(80,170,255,0.45)',
      textStyle: { color: '#dbeaff', fontSize: 12 },
      axisPointer: { lineStyle: { color: 'rgba(96,198,255,0.45)' } },
      formatter: (ps) => {
        const p = ps[0]
        return `${p.name}<br/>集团合计：<b>${Number(p.value).toFixed(1)}</b> 万元`
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: { lineStyle: { color: CHART_STYLE.axis } },
      axisTick: { show: false },
      axisLabel: { color: CHART_STYLE.text, fontSize: 12, margin: 14 }
    },
    yAxis: {
      type: 'value',
      scale: true,
      splitNumber: 4,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: CHART_STYLE.split, type: 'dashed' } },
      axisLabel: { color: CHART_STYLE.textDim, fontSize: 11 }
    },
    series: [
      {
        type: 'line',
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 7,
        z: 4,
        data: values,
        itemStyle: {
          color: '#3fe3ff',
          borderColor: '#06203c',
          borderWidth: 2,
          shadowColor: 'rgba(63,227,255,0.9)',
          shadowBlur: 12
        },
        lineStyle: {
          width: 2.6,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#2f7dff' },
            { offset: 1, color: '#3fe3ff' }
          ]),
          shadowColor: 'rgba(63,227,255,0.45)',
          shadowBlur: 14
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(63,227,255,0.34)' },
            { offset: 1, color: 'rgba(47,125,255,0.02)' }
          ])
        },
        label: {
          show: true,
          position: 'top',
          distance: 8,
          color: '#bfe6ff',
          fontSize: 12,
          fontFamily: 'Bahnschrift, Consolas, monospace',
          formatter: (p) => Number(p.value).toFixed(1)
        }
      }
    ]
  }
}
</script>

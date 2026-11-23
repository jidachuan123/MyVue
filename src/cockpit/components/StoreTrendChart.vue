<template>
  <div ref="el" class="store-trend"></div>
</template>

<script setup>
import { ref } from 'vue'
import * as echarts from 'echarts'
import { useChart, CHART_STYLE } from '../composables/useChart'

const props = defineProps({
  // [{ date: '11-16', amount: 506.55 }]
  data: { type: Array, default: () => [] }
})

const el = ref(null)

useChart(el, buildOption, () => props.data)

function buildOption(list) {
  const rows = Array.isArray(list) ? list : []

  return {
    animationDuration: 700,
    grid: { left: 62, right: 24, top: 30, bottom: 26 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(6,24,50,0.92)',
      borderColor: 'rgba(80,170,255,0.45)',
      textStyle: { color: '#dbeaff', fontSize: 12 },
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(63,227,255,0.08)' } },
      formatter: (ps) => {
        const p = ps[0]
        return `${p.name}<br/>门店销售：<b>${Number(p.value).toFixed(2)}</b> 万元`
      }
    },
    xAxis: {
      type: 'category',
      data: rows.map((r) => r.date),
      axisLine: { lineStyle: { color: CHART_STYLE.axis } },
      axisTick: { show: false },
      axisLabel: { color: CHART_STYLE.text, fontSize: 12, margin: 12 }
    },
    yAxis: {
      type: 'value',
      scale: true,
      splitNumber: 3,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: CHART_STYLE.split, type: 'dashed' } },
      axisLabel: { color: CHART_STYLE.textDim, fontSize: 11 }
    },
    series: [
      {
        type: 'bar',
        barWidth: 24,
        data: rows.map((r) => Number(r.amount || 0)),
        itemStyle: {
          borderRadius: [3, 3, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3fe3ff' },
            { offset: 1, color: 'rgba(47,125,255,0.25)' }
          ]),
          shadowColor: 'rgba(63,227,255,0.35)',
          shadowBlur: 10
        },
        label: {
          show: true,
          position: 'top',
          distance: 4,
          color: '#bfe6ff',
          fontSize: 11,
          fontFamily: 'Bahnschrift, Consolas, monospace',
          formatter: (p) => Number(p.value).toFixed(2)
        }
      }
    ]
  }
}
</script>

<style scoped>
.store-trend {
  width: 100%;
  height: 100%;
}
</style>

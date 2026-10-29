<template>
  <div ref="el" class="chart-box"></div>
</template>

<script setup>
import { ref } from 'vue'
import * as echarts from 'echarts'
import { useChart, CHART_STYLE } from '../composables/useChart'

const props = defineProps({
  // [{ name:'商管业态', amount:1282.2 }]
  data: { type: Array, default: () => [] }
})

// 业态配色（参照参考大屏：青 → 蓝 → 紫 → 金 → 绿 → 橙 → 粉）
const COLORS = ['#3fe3ff', '#2f7dff', '#a06bff', '#ffcf5c', '#31e6a8', '#ff8a4c', '#ff6ea9']

const el = ref(null)

useChart(el, buildOption, () => props.data)

function buildOption(list) {
  const rows = (Array.isArray(list) ? list : []).slice().sort((a, b) => b.amount - a.amount)
  const names = rows.map((r) => r.name)
  const values = rows.map((r) => Number(r.amount || 0))

  return {
    animationDuration: 900,
    grid: { left: 96, right: 62, top: 4, bottom: 10 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(63,227,255,0.06)' } },
      backgroundColor: 'rgba(6,24,50,0.92)',
      borderColor: 'rgba(80,170,255,0.45)',
      textStyle: { color: '#dbeaff', fontSize: 12 },
      formatter: (params) => {
        const p = params[0]
        return `${p.name}<br/>销售：<b>${Number(p.value).toFixed(2)}</b> 万元`
      }
    },
    xAxis: { type: 'value', show: false, max: (v) => v.max * 1.18 },
    yAxis: {
      type: 'category',
      inverse: true,
      data: names,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: CHART_STYLE.text,
        fontSize: 12.5,
        margin: 12,
        width: 84,
        overflow: 'truncate'
      }
    },
    series: [
      {
        type: 'bar',
        barWidth: 12,
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(70,148,240,0.07)',
          borderRadius: 6
        },
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
          color: (p) => {
            const c = COLORS[p.dataIndex % COLORS.length]
            return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: 'rgba(47,125,255,0.35)' },
              { offset: 1, color: c }
            ])
          }
        },
        label: {
          show: true,
          position: 'right',
          distance: 8,
          color: '#d9efff',
          fontSize: 12.5,
          fontFamily: 'Bahnschrift, Consolas, monospace',
          formatter: (p) => (p.value >= 100 ? Number(p.value).toFixed(0) : Number(p.value).toFixed(1))
        },
        data: values
      }
    ]
  }
}
</script>

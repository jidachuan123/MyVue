<template>
  <div ref="el" class="chart-box"></div>
</template>

<script setup>
import { ref } from 'vue'
import * as echarts from 'echarts'
import { useChart, CHART_STYLE } from '../composables/useChart'

const props = defineProps({
  // [{ date:'10-22', amount:1720.4, lastYear:1630.2 }]
  data: { type: Array, default: () => [] }
})

const el = ref(null)

useChart(el, buildOption, () => props.data)

function buildOption(list) {
  const rows = Array.isArray(list) ? list : []
  const dates = rows.map((r) => r.date)
  const cur = rows.map((r) => Number(r.amount || 0))
  const last = rows.map((r) => (r.lastYear == null ? null : Number(r.lastYear)))
  const hasLast = last.some((v) => v !== null)

  const series = [
    {
      name: '本期',
      type: 'line',
      smooth: 0.35,
      symbol: 'circle',
      symbolSize: 7,
      z: 4,
      data: cur,
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
          { offset: 0, color: 'rgba(63,227,255,0.38)' },
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
        formatter: (p) => Number(p.value).toFixed(0)
      }
    }
  ]

  if (hasLast) {
    series.push({
      name: '去年同期',
      type: 'line',
      smooth: 0.35,
      symbol: 'none',
      z: 3,
      data: last,
      lineStyle: {
        width: 1.6,
        type: 'dashed',
        color: 'rgba(160,107,255,0.85)'
      }
    })
  }

  return {
    animationDuration: 900,
    grid: { left: 72, right: 28, top: hasLast ? 46 : 30, bottom: 30 },
    legend: hasLast
      ? {
          right: 8,
          top: 4,
          itemWidth: 14,
          itemHeight: 8,
          textStyle: { color: CHART_STYLE.text, fontSize: 12 },
          data: ['本期', '去年同期']
        }
      : undefined,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(6,24,50,0.92)',
      borderColor: 'rgba(80,170,255,0.45)',
      textStyle: { color: '#dbeaff', fontSize: 12 },
      axisPointer: { lineStyle: { color: 'rgba(96,198,255,0.45)' } }
    },
    xAxis: {
      type: 'category',
      // true = 首尾留半个刻度，否则首尾两点的数据标签会顶到坐标轴边界上
      boundaryGap: true,
      data: dates,
      axisLine: { lineStyle: { color: CHART_STYLE.axis } },
      axisTick: { show: false },
      axisLabel: { color: CHART_STYLE.text, fontSize: 12, margin: 12 }
    },
    yAxis: {
      type: 'value',
      // scale:true = 不从 0 起画，否则 7 天的波动会被压成一条平线（刻度标签仍标明真实数值）
      scale: true,
      splitNumber: 4,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: CHART_STYLE.split, type: 'dashed' } },
      axisLabel: { color: CHART_STYLE.textDim, fontSize: 11 }
    },
    series
  }
}
</script>

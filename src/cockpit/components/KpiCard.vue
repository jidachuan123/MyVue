<template>
  <div class="kpi-card" :class="'kpi-card--' + kpi.tone">
    <!-- 左侧：标题 + 主数值 -->
    <div class="kpi-main">
      <div class="kpi-title">{{ kpi.label }}</div>

      <div class="kpi-figure">
        <span class="kpi-num">{{ displayValue }}</span>
        <span v-if="kpi.unit" class="kpi-unit">{{ kpi.unit }}</span>
      </div>

      <!-- 环比 / 同比 -->
      <div v-if="kpi.rates && kpi.rates.length" class="kpi-rates">
        <span v-for="r in kpi.rates" :key="r.label" class="kpi-rate">
          {{ r.label }}
          <b :class="rateClass(r.value)">{{ fmtPctArrow(r.value).text }}</b>
        </span>
      </div>

      <!-- 底部累计 -->
      <div v-if="kpi.foot && kpi.foot.length" class="kpi-foot">
        <span v-for="f in kpi.foot" :key="f.label" class="kpi-foot-item">
          {{ f.label }}
          <b class="num">{{ fmtAmount(f.value, 1) }}</b>
          <i :class="rateClass(f.trend)">{{ fmtPctArrow(f.trend).text }}</i>
        </span>
      </div>
    </div>

    <!-- 右侧：次要信息（实时卡 / 年累计卡） -->
    <div v-if="kpi.side || kpi.progress" class="kpi-side">
      <div v-if="kpi.side" class="kpi-side-line">
        {{ kpi.side.prefix }}
        <b :class="rateClass(kpi.side.value)">{{ fmtPctArrow(kpi.side.value).text }}</b>
      </div>

      <div v-if="kpi.progress" class="kpi-progress">
        <div class="kpi-progress-text">
          {{ kpi.progress.label }}
          <b>{{ fmtPct(kpi.progress.value, 1) }}</b>
        </div>
        <div class="kpi-progress-bar">
          <i :style="{ width: barWidth(kpi.progress.value) }"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { fmtAmount, fmtPct, fmtPctArrow, fmtInt, rateClass } from '../utils/format'

const props = defineProps({
  kpi: { type: Object, required: true }
})

/** 大数值用整数展示（年累计动辄几万），小额保留 1 位小数 */
const displayValue = computed(() => {
  const n = Number(props.kpi.amount)
  if (!Number.isFinite(n)) return '-'
  return n >= 10000 ? fmtInt(n) : fmtAmount(n, 1)
})

function barWidth(v) {
  const n = Math.max(0, Math.min(1, Number(v) || 0))
  return (n * 100).toFixed(1) + '%'
}
</script>

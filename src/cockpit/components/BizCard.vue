<template>
  <div class="biz-card" :class="['biz-card--' + card.tone, { 'biz-card--traffic': card.isTraffic }]">
    <!-- 标题行：业态名 + 标签 -->
    <div class="biz-hd">
      <span class="biz-name">{{ card.name }}</span>
      <span v-if="card.tag" class="biz-tag">{{ card.tag }}</span>
      <!-- 右上角迷你趋势线 -->
      <SparkLine
        v-if="card.spark && card.spark.length"
        class="biz-spark"
        :data="card.spark"
        :tone="card.tone"
      />
    </div>

    <!-- 主数值 -->
    <div class="biz-figure">
      <span class="biz-num">{{ displayValue }}</span>
      <span class="biz-unit">{{ card.unit || '万元' }}</span>
    </div>

    <!-- 比率 + 环形占比 -->
    <div class="biz-body">
      <div class="biz-left">
        <div v-if="!card.isTraffic" class="biz-rate">
          日环比
          <b :class="rateClass(card.dod)">{{ fmtPctArrow(card.dod).text }}</b>
        </div>
        <div class="biz-rate">
          年同比
          <b :class="rateClass(card.yoy)">{{ fmtPctArrow(card.yoy).text }}</b>
        </div>

        <!-- 客流卡用两组指标，业态卡用占比 + 特征值 -->
        <template v-if="card.isTraffic">
          <div class="biz-metric">
            {{ card.extraLabel }} <b>{{ card.extraValue }}</b>
          </div>
          <div class="biz-metric">
            {{ card.extra2Label }} <b>{{ card.extra2Value }}</b>
          </div>
        </template>
        <template v-else>
          <div class="biz-metric">占集团比重 <b>{{ fmtPct(card.share, 1) }}</b></div>
          <div class="biz-metric">{{ card.extraLabel }} <b>{{ card.extraValue }}</b></div>
        </template>
      </div>

      <!-- 环形占比图（客流卡不显示） -->
      <div v-if="!card.isTraffic" class="biz-ring" :style="ringStyle">
        <span>{{ fmtPct(card.share, 1) }}</span>
      </div>
    </div>

    <!-- 底部累计 -->
    <div v-if="!card.isTraffic" class="biz-foot">
      <span>月累计 <b>{{ fmtAmount(card.monthAcc, 1) }}</b></span>
      <span>年累计 <b>{{ fmtAmount(card.yearAcc, 1) }}</b></span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SparkLine from './SparkLine.vue'
import { fmtAmount, fmtPct, fmtPctArrow, fmtInt, rateClass } from '../utils/format'

const props = defineProps({
  card: { type: Object, required: true }
})

const TONE_COLORS = {
  orange: '#ff8a4c',
  cyan: '#3fe3ff',
  green: '#31e6a8',
  gold: '#ffcf5c',
  pink: '#ff6ea9',
  purple: '#a06bff',
  blue: '#2f7dff',
  teal: '#2ee6d6'
}

const displayValue = computed(() => {
  const n = Number(props.card.amount)
  if (!Number.isFinite(n)) return '-'
  // 客流是「人次」，用整数 + 千分位；金额统一 1 位小数
  return props.card.isTraffic ? fmtInt(n) : fmtAmount(n, 1)
})

/** 环形占比：用 conic-gradient 画，无需 SVG，性能最好 */
const ringStyle = computed(() => {
  const pct = Math.max(0, Math.min(1, Number(props.card.share) || 0)) * 100
  const color = TONE_COLORS[props.card.tone] || TONE_COLORS.cyan
  return {
    background: `conic-gradient(${color} 0turn ${pct / 100}turn, rgba(90, 150, 220, 0.16) ${pct / 100}turn 1turn)`
  }
})
</script>

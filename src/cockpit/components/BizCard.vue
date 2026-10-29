<template>
  <div class="biz-card">
    <div class="biz-card-hd">
      <span class="biz-card-name" :title="card.name">{{ card.name }}</span>
      <span v-if="card.type" class="biz-card-tag">{{ card.type }}</span>
    </div>

    <div class="biz-card-value">
      {{ fmtAmount(card.yesterday) }}<small>万元</small>
    </div>

    <!-- 两列指标：卡片最窄约 195px，横排会折行，这里固定成 2 列小格子 -->
    <div class="biz-card-rates">
      <div class="rate-item">
        <span>日环比</span>
        <b :class="rateClass(card.dod)">{{ fmtPct(card.dod) }}</b>
      </div>
      <div class="rate-item">
        <span>年同比</span>
        <b :class="rateClass(card.yoy)">{{ fmtPct(card.yoy) }}</b>
      </div>
    </div>

    <div class="biz-card-acc">
      <span>月累计 <i>{{ fmtAmount(card.monthAcc, 0) }}</i></span>
      <span>年累计 <i>{{ fmtAmount(card.yearAcc, 0) }}</i></span>
    </div>
  </div>
</template>

<script setup>
import { fmtAmount, fmtPct, rateClass } from '../utils/format'

defineProps({
  // { name, type, yesterday, dod, yoy, monthAcc, yearAcc }
  card: { type: Object, required: true }
})
</script>

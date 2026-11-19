<template>
  <div class="rank-list">
    <div v-for="item in rows" :key="item.seq" class="rank-row">
      <span class="rank-seq">{{ String(item.seq).padStart(2, '0') }}</span>
      <span class="rank-name">{{ item.name }}</span>
      <span class="rank-track">
        <i :style="{ width: barWidth(item.amount), background: item.color }"></i>
      </span>
      <span class="rank-amt num">{{ fmtAmount(item.amount, 1) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { fmtAmount } from '../utils/format'

const props = defineProps({
  // [{ seq, name, amount, color }]
  items: { type: Array, default: () => [] }
})

/** 按金额降序，并重新编号（后端给什么顺序都稳妥） */
const rows = computed(() =>
  [...props.items].sort((a, b) => Number(b.amount) - Number(a.amount))
)

const maxAmount = computed(() =>
  Math.max(1, ...rows.value.map((r) => Number(r.amount) || 0))
)

function barWidth(v) {
  const pct = (Number(v) || 0) / maxAmount.value
  return Math.max(2, pct * 100).toFixed(1) + '%'
}
</script>

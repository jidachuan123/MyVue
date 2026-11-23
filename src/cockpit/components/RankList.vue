<template>
  <div class="rank-list">
    <div v-for="item in rows" :key="item.seq" class="rank-row">
      <span class="rank-seq">{{ String(item.seq).padStart(2, '0') }}</span>
      <span class="rank-name">{{ item.name }}</span>
      <span class="rank-track">
        <i :style="{ width: barWidth(item.amount), background: item.color }"></i>
      </span>
      <span class="rank-amt num">{{ fmtAmount(item.amount, 2) }}</span>
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

/** 严格按后端给的顺序渲染（2026-11-23 业务要求固定排序，不按金额重排） */
const rows = computed(() => [...props.items])

const maxAmount = computed(() =>
  Math.max(1, ...rows.value.map((r) => Number(r.amount) || 0))
)

function barWidth(v) {
  const pct = (Number(v) || 0) / maxAmount.value
  return Math.max(2, pct * 100).toFixed(1) + '%'
}
</script>

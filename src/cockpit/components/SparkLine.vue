<template>
  <svg class="spark" :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none">
    <defs>
      <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="color" stop-opacity="0.34" />
        <stop offset="100%" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>

    <path :d="shape.area" :fill="`url(#${gradId})`" />
    <path
      :d="shape.line"
      fill="none"
      :stroke="color"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import { sparkPath, sparkTone } from '../utils/spark'

const props = defineProps({
  data: { type: Array, default: () => [] },
  tone: { type: String, default: 'cyan' },
  width: { type: Number, default: 120 },
  height: { type: Number, default: 34 }
})

/** 每个实例独立的渐变 id，否则同页多个 spark 会互相覆盖渐变 */
const gradId = computed(() => `spark-grad-${Math.random().toString(36).slice(2, 9)}`)

const color = computed(() => sparkTone(props.tone))

const shape = computed(() => sparkPath(props.data, props.width, props.height))
</script>

<template>
  <div class="store-tbl">
    <!-- 表头单独一张表，滚动时固定不动 -->
    <table>
      <colgroup>
        <col v-for="c in COLS" :key="c.key" :style="{ width: c.w + 'px' }" />
      </colgroup>
      <thead>
        <tr>
          <th v-for="c in COLS" :key="c.key">{{ c.label }}</th>
        </tr>
      </thead>
    </table>

    <!-- 表体：行数超过可视区时整体缓慢上滚，鼠标悬停暂停 -->
    <div class="store-body">
      <div class="store-scroll" :class="{ 'is-scroll': needScroll }" :style="scrollStyle">
        <table v-for="copy in copies" :key="copy" :aria-hidden="copy === 1 ? 'true' : null">
          <colgroup>
            <col v-for="c in COLS" :key="c.key" :style="{ width: c.w + 'px' }" />
          </colgroup>
          <tbody>
            <tr v-for="row in rows" :key="copy + '-' + row.seq">
              <td>{{ row.seq }}</td>
              <td class="col-name" :title="row.name">{{ row.name }}</td>
              <td>{{ row.region || '-' }}</td>
              <td class="col-amt">{{ fmtAmount(row.yesterday) }}</td>
              <td :class="fmtPctArrow(row.yoy).cls">{{ fmtPctArrow(row.yoy).text }}</td>
              <td :class="fmtPctArrow(row.mom).cls">{{ fmtPctArrow(row.mom).text }}</td>
              <td>{{ (Number(row.grossRate) * 100).toFixed(1) }}%</td>
              <td>{{ Number(row.avgTicket).toFixed(1) }}</td>
              <td>{{ fmtInt(row.customers) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { fmtAmount, fmtInt, fmtPctArrow } from '../utils/format'

const props = defineProps({
  rows: { type: Array, default: () => [] }
})

/**
 * 列宽合计 656px = 面板 676 - 左右 padding 20。
 * 改了列宽记得同步这边，否则表头和表体会错位（两张表靠 colgroup 对齐）。
 */
const COLS = [
  { key: 'seq', label: '序号', w: 36 },
  { key: 'name', label: '门店', w: 156 },
  { key: 'region', label: '区域', w: 54 },
  { key: 'yesterday', label: '昨日销售', w: 92 },
  { key: 'yoy', label: '同比', w: 66 },
  { key: 'mom', label: '环比', w: 66 },
  { key: 'grossRate', label: '毛利率', w: 58 },
  { key: 'avgTicket', label: '客单价', w: 62 },
  { key: 'customers', label: '客流量', w: 66 }
]

// 一行 34px 高，可视区约 12 行；超过才需要滚动（否则会出现重复的一份）
const VISIBLE_ROWS = 12

const needScroll = computed(() => props.rows.length > VISIBLE_ROWS)
const copies = computed(() => (needScroll.value ? [0, 1] : [0]))

const scrollStyle = computed(() => {
  if (!needScroll.value) return {}
  // 每行约 2.4 秒，行数越多滚得越慢越稳
  return { animationDuration: `${props.rows.length * 2.4}s` }
})
</script>

<style scoped>
.store-scroll.is-scroll {
  animation-name: store-roll;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
</style>

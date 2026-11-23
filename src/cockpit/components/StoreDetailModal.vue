<template>
  <div v-if="modelValue" class="detail-mask" @click.self="close">
    <div class="detail-panel">
      <header class="dp-hd">
        <div class="dp-title">
          {{ storeName || storeId || (isClass ? '业态' : '门店') }}
          <span class="dp-sub">
            {{ isClass ? '业态下钻' : '门店下钻' }}
            <template v-if="data?.summary?.storeCount != null"> · {{ data.summary.storeCount }} 家门店</template>
            · {{ data?.date || '--' }}
          </span>
        </div>
        <button class="dp-close" title="关闭" @click="close">×</button>
      </header>

      <div v-if="loading" class="dp-state">加载中…</div>
      <div v-else-if="error" class="dp-state dp-state--error">{{ error }}</div>

      <template v-else-if="data">
        <!-- 汇总三块 -->
        <div class="dp-kpis">
          <div class="dp-kpi">
            <div class="dp-kpi-label">昨日销售（万元）</div>
            <div class="dp-kpi-num">{{ fmtAmount(data.summary.daySale, 2) }}</div>
            <div class="dp-kpi-rates">
              <span>日环比 <b :class="rateClass(data.summary.dayChain)">{{ fmtPctArrow(data.summary.dayChain).text }}</b></span>
              <span>年同比 <b :class="rateClass(data.summary.dayYear)">{{ fmtPctArrow(data.summary.dayYear).text }}</b></span>
            </div>
          </div>
          <div class="dp-kpi">
            <div class="dp-kpi-label">本月累计（万元）</div>
            <div class="dp-kpi-num">{{ fmtAmount(data.summary.monthSale, 2) }}</div>
            <div class="dp-kpi-rates">
              <span>月环比 <b :class="rateClass(data.summary.monthChain)">{{ fmtPctArrow(data.summary.monthChain).text }}</b></span>
              <span>年同比 <b :class="rateClass(data.summary.monthYear)">{{ fmtPctArrow(data.summary.monthYear).text }}</b></span>
            </div>
          </div>
          <div class="dp-kpi">
            <div class="dp-kpi-label">本年累计（万元）</div>
            <div class="dp-kpi-num">{{ fmtAmount(data.summary.yearSale, 2) }}</div>
            <div class="dp-kpi-rates">
              <span>年同比 <b :class="rateClass(data.summary.yearYear)">{{ fmtPctArrow(data.summary.yearYear).text }}</b></span>
            </div>
          </div>
        </div>

        <!-- 近 7 日销售柱状图 -->
        <div class="dp-trend">
          <div class="dp-trend-title">近 7 日销售（万元）</div>
          <div class="dp-trend-chart">
            <StoreTrendChart :data="data.trend7d || []" />
          </div>
        </div>

        <!-- 明细：门店下钻看三级品类；业态下钻看门店列表 -->
        <div class="dp-table-wrap">
          <!-- 门店下钻：三级品类 -->
          <table v-if="!isClass" class="dp-table">
            <thead>
              <tr>
                <th class="col-seq">#</th>
                <th class="col-name">品类（三级）</th>
                <th>昨日销售（万元）</th>
                <th>日环比</th>
                <th>年同比</th>
                <th>月累计（万元）</th>
                <th>年累计（万元）</th>
                <th>占比</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in data.categories" :key="c.ccode">
                <td class="col-seq">{{ String(i + 1).padStart(2, '0') }}</td>
                <td class="col-name" :title="c.name">{{ c.name }}</td>
                <td class="num">{{ fmtAmount(c.daySale, 2) }}</td>
                <td class="num" :class="rateClass(c.dayChain)">{{ fmtPctArrow(c.dayChain).text }}</td>
                <td class="num" :class="rateClass(c.dayYear)">{{ fmtPctArrow(c.dayYear).text }}</td>
                <td class="num">{{ fmtAmount(c.monthSale, 2) }}</td>
                <td class="num">{{ fmtAmount(c.yearSale, 2) }}</td>
                <td class="num">{{ fmtShare(c.share) }}</td>
              </tr>
              <tr v-if="!data.categories || !data.categories.length">
                <td colspan="8" class="dp-empty">该门店暂无品类销售数据</td>
              </tr>
            </tbody>
          </table>

          <!-- 业态下钻：门店列表 -->
          <table v-else class="dp-table">
            <thead>
              <tr>
                <th class="col-seq">#</th>
                <th class="col-name">门店</th>
                <th>昨日销售（万元）</th>
                <th>日环比</th>
                <th>年同比</th>
                <th>月累计（万元）</th>
                <th>年累计（万元）</th>
                <th>占比</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, i) in data.stores" :key="s.storeId">
                <td class="col-seq">{{ String(i + 1).padStart(2, '0') }}</td>
                <td class="col-name" :title="s.name">{{ s.name }}</td>
                <td class="num">{{ fmtAmount(s.daySale, 2) }}</td>
                <td class="num" :class="rateClass(s.dayChain)">{{ fmtPctArrow(s.dayChain).text }}</td>
                <td class="num" :class="rateClass(s.dayYear)">{{ fmtPctArrow(s.dayYear).text }}</td>
                <td class="num">{{ fmtAmount(s.monthSale, 2) }}</td>
                <td class="num">{{ fmtAmount(s.yearSale, 2) }}</td>
                <td class="num">{{ fmtShare(s.share) }}</td>
              </tr>
              <tr v-if="!data.stores || !data.stores.length">
                <td colspan="8" class="dp-empty">该业态暂无门店销售数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { fmtAmount, fmtPctArrow, rateClass } from '../utils/format'
import StoreTrendChart from './StoreTrendChart.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  storeId: { type: String, default: '' },
  /** 业态编码：有值且无 storeId 时走业态下钻 */
  classCode: { type: String, default: '' },
  storeName: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const error = ref('')
const data = ref(null)

const visible = computed(() => props.modelValue)
const isClass = computed(() => !props.storeId && !!props.classCode)

/** 占比：只显示百分比，不带正负号 */
function fmtShare(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '-'
  return `${(n * 100).toFixed(2)}%`
}

async function fetchDetail() {
  if (!props.storeId && !props.classCode) return
  loading.value = true
  error.value = ''
  data.value = null
  try {
    const classMode = isClass.value
    const endpoint = classMode ? 'class-detail' : 'store-detail'
    const qs = new URLSearchParams()
    if (classMode) {
      qs.set('classCode', props.classCode)
      if (props.storeName) qs.set('className', props.storeName)
    } else {
      qs.set('storeId', props.storeId)
      if (props.storeName) qs.set('storeName', props.storeName)
    }
    const res = await fetch(`/api/provider/cockpit/${endpoint}?${qs}`, {
      headers: { Accept: 'application/json' }
    })
    if (!res.ok) throw new Error(`接口返回 ${res.status}`)
    const json = await res.json()
    if (Number(json.code) !== 0) throw new Error(json.msg || '接口返回失败')
    data.value = json.result
  } catch (e) {
    error.value = `下钻数据加载失败：${e.message}`
  } finally {
    loading.value = false
  }
}

function close() {
  emit('update:modelValue', false)
}

watch(
  () => [props.modelValue, props.storeId, props.classCode],
  ([open]) => {
    if (open) fetchDetail()
  },
  { immediate: true }
)
</script>

<style scoped>
.detail-mask {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(1, 6, 15, 0.78);
  backdrop-filter: blur(3px);
}

.detail-panel {
  display: flex;
  flex-direction: column;
  width: 92vw;
  max-width: 1500px;
  max-height: 86vh;
  border: 1px solid rgba(96, 198, 255, 0.55);
  border-radius: 4px;
  background: linear-gradient(162deg, rgba(20, 60, 120, 0.98), rgba(6, 20, 44, 0.99));
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), inset 0 0 40px rgba(30, 118, 220, 0.25);
  overflow: hidden;
}

.dp-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(70, 148, 240, 0.25);
  background: linear-gradient(90deg, rgba(34, 96, 180, 0.45), rgba(20, 60, 120, 0.05));
}

.dp-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #e8f5ff;
}

.dp-sub {
  margin-left: 12px;
  font-size: 13px;
  font-weight: 400;
  color: var(--c-text-3);
  letter-spacing: 0.5px;
}

.dp-close {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(120, 190, 255, 0.4);
  border-radius: 4px;
  background: rgba(6, 22, 48, 0.6);
  color: #a9d3ff;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}
.dp-close:hover {
  color: #3fe3ff;
  border-color: rgba(63, 227, 255, 0.8);
}

.dp-state {
  padding: 60px 0;
  text-align: center;
  font-size: 16px;
  color: var(--c-text-2);
}
.dp-state--error { color: #ff5f7a; }

.dp-kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(70, 148, 240, 0.18);
}

.dp-kpi {
  padding: 12px 16px;
  border: 1px solid rgba(70, 148, 240, 0.26);
  border-radius: 3px;
  background: linear-gradient(162deg, rgba(26, 76, 150, 0.4), rgba(8, 26, 54, 0.5));
}

.dp-kpi-label { font-size: 14px; color: var(--c-text-2); }

.dp-kpi-num {
  margin: 6px 0 8px;
  font-family: var(--font-num);
  font-size: 34px;
  font-weight: 700;
  color: #f4faff;
  text-shadow: 0 0 18px rgba(63, 227, 255, 0.45);
}

.dp-kpi-rates {
  display: flex;
  gap: 18px;
  font-size: 13px;
  color: var(--c-text-3);
}
.dp-kpi-rates b {
  margin-left: 4px;
  font-family: var(--font-num);
  font-size: 14px;
}

.dp-trend {
  display: flex;
  flex-direction: column;
  height: 190px;
  padding: 8px 20px 0;
  border-bottom: 1px solid rgba(70, 148, 240, 0.18);
}

.dp-trend-title {
  flex: 0 0 auto;
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--c-text-3);
}

.dp-trend-chart {
  flex: 1;
  min-height: 0;
}

.dp-table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 20px 18px;
}

.dp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.dp-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 10px 12px;
  text-align: right;
  font-weight: 600;
  color: #9dc4f0;
  background: #0d2a52;
  border-bottom: 1px solid rgba(96, 198, 255, 0.35);
  white-space: nowrap;
}

.dp-table thead th.col-seq,
.dp-table thead th.col-name { text-align: left; }

/* 基础色放在 tbody 上让 td 继承；直接写在 td 上会盖掉 .up/.down 的涨跌色 */
.dp-table tbody {
  color: #cfe4ff;
}

.dp-table tbody td {
  padding: 8px 12px;
  text-align: right;
  border-bottom: 1px solid rgba(70, 148, 240, 0.1);
  white-space: nowrap;
}

/* 涨跌色显式覆盖（作用在 td 上，优先级要高于上面的基础样式） */
.dp-table tbody td.up { color: #ff5f7a; }
.dp-table tbody td.down { color: #31e6a8; }

.dp-table tbody td.col-seq { text-align: left; color: var(--c-text-3); }
.dp-table tbody td.col-name {
  text-align: left;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dp-table tbody tr:hover td { background: rgba(47, 125, 255, 0.12); }

.num { font-family: var(--font-num); font-variant-numeric: tabular-nums; }

.dp-empty {
  text-align: center !important;
  color: var(--c-text-3) !important;
  padding: 30px 0 !important;
}
</style>

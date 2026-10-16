<template>
  <div class="sales-detail-page">
    <!-- 标题区域 -->
    <div class="page-header">
      <h2>{{ reportTitle }}</h2>
      <div class="date-info">
        <span class="tag current">记账日期：{{ queryForm.accStartDate }} ~ {{ queryForm.accEndDate }}</span>
        <span v-if="rows.length" class="tag loaded">共 {{ rows.length }} 行</span>
      </div>
    </div>

    <!-- 查询区域：页面上可输入的参数只有 6 日期 + 发货机构（★ 全部控件合并为一行） -->
    <div class="query-panel">
      <div class="query-row">
        <div class="query-item">
          <label>记账日期:</label>
          <input type="date" v-model="queryForm.accStartDate" />
          <span class="sep">~</span>
          <input type="date" v-model="queryForm.accEndDate" />
        </div>
        <div class="query-item">
          <label>环比日期:</label>
          <input type="date" v-model="queryForm.cmpStartDate" />
          <span class="sep">~</span>
          <input type="date" v-model="queryForm.cmpEndDate" />
        </div>
        <div class="query-item">
          <label>同比日期:</label>
          <input type="date" v-model="queryForm.yoyStartDate" />
          <span class="sep">~</span>
          <input type="date" v-model="queryForm.yoyEndDate" />
        </div>
        <div class="query-item">
          <label>发货机构:</label>
          <input
            type="text"
            class="org-input"
            v-model="queryForm.outOrgCodes"
            placeholder="精确匹配，多个用英文逗号分隔：1101901,1191201；空=全部"
          />
        </div>
        <div class="query-actions">
          <button class="btn-primary" @click="fetchData" :disabled="loading">
            {{ loading ? '查询中...' : '查询' }}
          </button>
          <button class="btn-default" @click="resetForm">重置</button>
          <button class="btn-export" @click="exportExcel">导出Excel</button>
        </div>
      </div>
      <div class="query-error" v-if="errorMsg">{{ errorMsg }}</div>
    </div>

    <!-- 表格 -->
    <div class="table-wrapper">
      <table class="sales-table">
        <thead>
          <tr>
            <th class="col-seq">序号</th>
            <th class="col-code">发货机构编码</th>
            <th class="col-store">发货机构名称</th>
            <th class="col-num">当日库存金额</th>
            <th class="col-num">发货结算金额</th>
            <th class="col-num">环比发货结算金额</th>
            <th class="col-num">同比发货结算金额</th>
            <th class="col-rate">环比增长率</th>
            <th class="col-rate">同比增长率</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in rows" :key="idx">
            <td class="col-seq">{{ row.seq }}</td>
            <td class="col-code">{{ row.outOrgCode }}</td>
            <td class="col-store col-name">{{ row.outOrgName }}</td>
            <td class="col-num">{{ formatAmount(row.stockAmt) }}</td>
            <td class="col-num">{{ formatAmount(row.sendAmt) }}</td>
            <td class="col-num">{{ formatAmount(row.cmpAmt) }}</td>
            <td class="col-num">{{ formatAmount(row.yoyAmt) }}</td>
            <td class="col-rate" :class="rateClass(row.cmpRate)">
              <span class="rate-arrow">{{ rateArrow(row.cmpRate) }}</span><span class="rate-num">{{ rateText(row.cmpRate) }}</span>
            </td>
            <td class="col-rate" :class="rateClass(row.yoyRate)">
              <span class="rate-arrow">{{ rateArrow(row.yoyRate) }}</span><span class="rate-num">{{ rateText(row.yoyRate) }}</span>
            </td>
          </tr>
          <tr v-if="!rows.length && !loading">
            <td colspan="9" class="empty-tip">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '../utils/request'

// ========== 默认查询日期（与 SD1 推算逻辑一致：记账=前一天、环比=前两天、同比=去年同日） ==========
function fmtDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function defaultQueryForm() {
  const now = new Date()
  const acc = new Date(now); acc.setDate(now.getDate() - 1)
  const cmp = new Date(now); cmp.setDate(now.getDate() - 2)
  const yoy = new Date(now); yoy.setFullYear(now.getFullYear() - 1)
  return {
    accStartDate: fmtDate(acc),
    accEndDate: fmtDate(acc),
    cmpStartDate: fmtDate(cmp),
    cmpEndDate: fmtDate(cmp),
    yoyStartDate: fmtDate(yoy),
    yoyEndDate: fmtDate(yoy),
    outOrgCodes: ''
  }
}

const queryForm = ref(defaultQueryForm())
const rows = ref([])
const loading = ref(false)
const errorMsg = ref('')

// 标题：记账日期 + 配送调拨汇总表
function fmtCnDate(s) {
  if (!s) return ''
  const p = String(s).split('-')
  if (p.length < 3) return String(s)
  return `${p[0]}年${Number(p[1])}月${Number(p[2])}号`
}
const reportTitle = computed(() => {
  const a = fmtCnDate(queryForm.value.accStartDate)
  const b = fmtCnDate(queryForm.value.accEndDate)
  const datePart = a === b ? a : `${a}~${b}`
  return `${datePart} 配送调拨汇总表`
})

function formatAmount(v) {
  if (v === null || v === undefined || v === '') return '0.00'
  const n = Number(v)
  if (isNaN(n)) return '0.00'
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 增长率：与 SD1 / 截图服务口径完全一致 —— 涨=绿▲+正号、跌=红▼、null='-'
function rateArrow(v) {
  if (v === null || v === undefined || v === '') return ''
  const n = Number(v)
  if (isNaN(n) || n === 0) return ''
  return n > 0 ? '▲' : '▼'
}

// 增长率数值文本（小数 → 百分比，如 +154.64% / -57.89%；null → '-'）
function rateText(v) {
  if (v === null || v === undefined || v === '') return '-'
  const n = Number(v)
  if (isNaN(n)) return '-'
  const prefix = n > 0 ? '+' : ''
  return `${prefix}${(n * 100).toFixed(2)}%`
}

function rateClass(v) {
  if (v === null || v === undefined || v === '') return ''
  const n = Number(v)
  if (isNaN(n) || n === 0) return ''
  return n > 0 ? 'rate-up' : 'rate-down'
}

// ========== 加载默认参数（后端推算的 6 日期 + 发货机构默认值） ==========
async function loadOptions() {
  try {
    const res = await request.get('/provider/sd4/options')
    if (res) {
      if (res.defaultAccStartDate) {
        queryForm.value.accStartDate = res.defaultAccStartDate
        queryForm.value.accEndDate = res.defaultAccEndDate || res.defaultAccStartDate
      }
      if (res.defaultCmpStartDate) {
        queryForm.value.cmpStartDate = res.defaultCmpStartDate
        queryForm.value.cmpEndDate = res.defaultCmpEndDate || res.defaultCmpStartDate
      }
      if (res.defaultYoyStartDate) {
        queryForm.value.yoyStartDate = res.defaultYoyStartDate
        queryForm.value.yoyEndDate = res.defaultYoyEndDate || res.defaultYoyStartDate
      }
      if (res.defaultOutOrgCodes) {
        queryForm.value.outOrgCodes = res.defaultOutOrgCodes
      }
    }
  } catch (e) {
    console.warn('[SD4] 加载默认参数失败，使用本地推算值', e)
  }
}

// ========== 查询 ==========
async function fetchData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await request.get('/provider/sd4/query', {
      accStartDate: queryForm.value.accStartDate,
      accEndDate: queryForm.value.accEndDate,
      cmpStartDate: queryForm.value.cmpStartDate,
      cmpEndDate: queryForm.value.cmpEndDate,
      yoyStartDate: queryForm.value.yoyStartDate,
      yoyEndDate: queryForm.value.yoyEndDate,
      outOrgCodes: queryForm.value.outOrgCodes
    })
    rows.value = (res && res.rows) || []
  } catch (e) {
    errorMsg.value = '查询失败：' + (e && e.message ? e.message : e)
    rows.value = []
  } finally {
    loading.value = false
  }
}

function resetForm() {
  queryForm.value = defaultQueryForm()
}

// ========== 导出 Excel（CSV，Excel 可直接打开） ==========
function exportExcel() {
  if (!rows.value.length) {
    errorMsg.value = '没有数据可导出'
    return
  }
  const header = ['序号', '发货机构编码', '发货机构名称', '当日库存金额', '发货结算金额',
    '环比发货结算金额', '同比发货结算金额', '环比增长率', '同比增长率']
  const lines = [header.join(',')]
  for (const r of rows.value) {
    lines.push([
      r.seq, r.outOrgCode, r.outOrgName, r.stockAmt, r.sendAmt, r.cmpAmt, r.yoyAmt,
      rateText(r.cmpRate), rateText(r.yoyRate)
    ].map(v => `"${String(v === null || v === undefined ? '' : v).replace(/"/g, '""')}"`).join(','))
  }
  // BOM 防 Excel 中文乱码
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `配送调拨汇总表_${queryForm.value.accStartDate}_${queryForm.value.accEndDate}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  await loadOptions()
  await fetchData()
})
</script>

<style scoped>
.sales-detail-page {
  /* 9 列，宽度略宽于 SD3 */
  width: 88%;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  font-size: 13px;
  color: #333;
}

/* 标题 */
.page-header {
  text-align: center;
  padding: 20px 16px 12px;
  border-bottom: 1px solid #e8e8e8;
  background: #fff;
}
.page-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #b71c1c;
  margin-bottom: 10px;
  letter-spacing: 1px;
}
.date-info {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}
.tag {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 4px;
  font-weight: 500;
}
.tag.current { background: #fff; color: #1565c0; }
.tag.loaded { background: #fff; color: #2e7d32; }

/* 查询 */
.query-panel {
  padding: 14px 20px;
  border-bottom: 1px solid #e8e8e8;
  background: #fff;
}
.query-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.query-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.query-item label {
  white-space: nowrap;
  color: #555;
  font-size: 13px;
}
.query-item .sep { color: #999; }
.query-item input[type='date'],
.query-item input[type='text'] {
  padding: 5px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  background: #fff;
}
.query-item input[type='date'] { width: 130px; }
/* 发货机构输入框：宽度压缩（原 280px），保证「同比日期 + 发货机构 + 按钮」稳定在一行 */
.query-item input[type='text'].org-input { width: 200px; }
.query-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}
.query-error {
  color: #d32f2f;
  font-size: 12px;
  margin-top: 6px;
}
.btn-primary {
  background: #1890ff;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}
.btn-primary:hover { background: #40a9ff; }
.btn-primary:disabled { background: #91caff; cursor: not-allowed; }
.btn-default {
  background: #fff;
  color: #555;
  border: 1px solid #d9d9d9;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.btn-default:hover { border-color: #40a9ff; color: #1890ff; }
.btn-export {
  background: #52c41a;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.btn-export:hover { background: #73d13d; }

/* 表格 */
.table-wrapper {
  overflow-x: auto;
  padding: 0 0 12px;
}
.sales-table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}
.sales-table th {
  padding: 9px 8px;
  border: 1px solid #000;
  text-align: center;
  background: #fafafa;
  color: #333;
  font-weight: 700;
  font-size: 13px;
}
.sales-table td {
  padding: 7px 8px;
  border: 1px solid #000;
  text-align: center;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}
.col-name { text-align: center !important; vertical-align: middle; }
.col-seq { width: 52px; }
.col-code { width: 110px; }
.col-store { min-width: 200px; }

/* 增长率对齐与配色（与 SD1 完全一致）：
   箭头与数值拆两段保证对齐；涨=绿▲、跌=红▼，数字统一黑色 */
.rate-arrow { display: inline-block; width: 1em; text-align: center; }
.rate-num { display: inline-block; min-width: 4.6em; text-align: right; }
.sales-table td.rate-up .rate-arrow {
  color: #2e7d32 !important;
  font-weight: 600;
}
.sales-table td.rate-up .rate-num {
  color: #1a1a1a;
  font-weight: 600;
}
.sales-table td.rate-down .rate-arrow {
  color: #c62828 !important;
  font-weight: 600;
}
.sales-table td.rate-down .rate-num {
  color: #1a1a1a;
  font-weight: 600;
}

.empty-tip {
  padding: 24px;
  color: #999;
  font-size: 13px;
}
</style>

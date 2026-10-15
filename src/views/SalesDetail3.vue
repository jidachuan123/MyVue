<template>
  <div class="sales-detail-page">
    <!-- 标题区域 -->
    <div class="page-header">
      <h2>{{ reportTitle }}</h2>
      <div class="date-info">
        <span class="tag current">查询日期：{{ queryForm.startDate }} ~ {{ queryForm.endDate }}</span>
        <span v-if="rows.length" class="tag loaded">共 {{ rows.length }} 行</span>
      </div>
    </div>

    <!-- 查询区域 -->
    <div class="query-panel">
      <div class="query-row">
        <div class="query-item">
          <label>开始日期:</label>
          <input type="date" v-model="queryForm.startDate" />
        </div>
        <div class="query-item">
          <label>结束日期:</label>
          <input type="date" v-model="queryForm.endDate" />
        </div>
        <div class="query-item">
          <label>机构编码:</label>
          <input
            type="text"
            v-model="queryForm.orgCode"
            placeholder="精确匹配，多个用英文逗号分隔：1103011,1103021；空=全部"
            style="width:300px"
          />
        </div>
        <div class="query-item">
          <label>渠道:</label>
          <select v-model="queryForm.chnl">
            <option value="">全部</option>
            <option v-for="c in chnlOptions" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="query-item">
          <label>订单号:</label>
          <input type="text" v-model="queryForm.orderNo" placeholder="空=不筛选" style="width:130px" />
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
            <th class="col-code">门店编码</th>
            <th class="col-store">门店名称</th>
            <th class="col-chnl">平台</th>
            <th class="col-num">销售额/元</th>
            <th class="col-num">订单数</th>
            <th class="col-num">客单价/元</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in rows" :key="idx" :class="rowClass(row)">
            <!-- 序号/门店编码/门店名称：整块（明细+合计）纵向合并，span=0 的行不输出这三个单元格 -->
            <td v-if="spanOf(row) > 0" class="col-seq" :rowspan="spanOf(row)">
              {{ row.seq == null ? '' : row.seq }}
            </td>
            <template v-if="spanOf(row) > 0">
              <td class="col-code" :rowspan="spanOf(row)">{{ row.storeCode }}</td>
              <td class="col-store col-name" :rowspan="spanOf(row)">{{ row.storeName }}</td>
            </template>
            <td class="col-chnl">{{ row.chnl }}</td>
            <td class="col-num">{{ formatAmount(row.saleAmt) }}</td>
            <td class="col-num">{{ row.orderCnt }}</td>
            <td class="col-num">{{ formatAmount(row.avgPrice) }}</td>
          </tr>
          <!-- 总计行：左侧 4 列合并成一个大格，文案来自后端配置 -->
          <tr v-if="total && rows.length" class="total">
            <td colspan="4">{{ total.totalLabel || '线上外卖销售共计' }}</td>
            <td class="col-num">{{ formatAmount(total.saleAmt) }}</td>
            <td class="col-num">{{ total.orderCnt }}</td>
            <td class="col-num">{{ formatAmount(total.avgPrice) }}</td>
          </tr>
          <tr v-if="!rows.length && !loading">
            <td colspan="7" class="empty-tip">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '../utils/request'

// ========== 默认查询日期：本期 = 前一天 ==========
function fmtDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function defaultQueryForm() {
  const now = new Date()
  const prev = new Date(now)
  prev.setDate(now.getDate() - 1)
  return {
    startDate: fmtDate(prev),
    endDate: fmtDate(prev),
    orgCode: '',
    chnl: '',
    orderNo: ''
  }
}

const queryForm = ref(defaultQueryForm())
const chnlOptions = ref([])
const rows = ref([])
const total = ref(null)
const loading = ref(false)
const errorMsg = ref('')

// 标题：日期 + 销售详情3
function fmtCnDate(s) {
  if (!s) return ''
  const p = String(s).split('-')
  if (p.length < 3) return String(s)
  return `${p[0]}年${Number(p[1])}月${Number(p[2])}号`
}
const reportTitle = computed(() => {
  const a = fmtCnDate(queryForm.value.startDate)
  const b = fmtCnDate(queryForm.value.endDate)
  const datePart = a === b ? a : `${a}~${b}`
  return `${datePart} 销售详情3`
})

function rowClass(row) {
  if (row.rowType === 'subtotal') return 'subtotal'
  return ''
}

// 序号/门店编码/门店名称 合并单元格的 rowspan 取值：
//   后端返回 storeRowSpan（门店首行 = 明细行数 + 合计行数，其余行 = 0）
//   ★ 旧版后端没有这个字段 → 按 1 处理（正常渲染、不合并），防止列错位
function spanOf(row) {
  const s = row.storeRowSpan
  if (s === 0) return 0
  return s || 1
}

function formatAmount(v) {
  if (v === null || v === undefined || v === '') return '0.00'
  const n = Number(v)
  if (isNaN(n)) return '0.00'
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ========== 加载渠道下拉选项（来自后端配置） ==========
async function loadOptions() {
  try {
    const res = await request.get('/provider/sd3/options')
    if (res && res.chnlOptions) {
      chnlOptions.value = res.chnlOptions
    }
    if (res && res.defaultOrgCode) {
      queryForm.value.orgCode = res.defaultOrgCode
    }
    if (res && res.defaultChnl) {
      queryForm.value.chnl = res.defaultChnl
    }
  } catch (e) {
    console.warn('[SD3] 加载选项失败', e)
    chnlOptions.value = ['昂捷到家01', '美团闪购', '淘宝闪购', '03京东到家']
  }
}

// ========== 查询 ==========
async function fetchData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await request.get('/provider/sd3/query', {
      startDate: queryForm.value.startDate,
      endDate: queryForm.value.endDate,
      orgCode: queryForm.value.orgCode,
      chnl: queryForm.value.chnl,
      orderNo: queryForm.value.orderNo
    })
    rows.value = (res && res.rows) || []
    total.value = (res && res.total) || null
  } catch (e) {
    errorMsg.value = '查询失败：' + (e && e.message ? e.message : e)
    rows.value = []
    total.value = null
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
  const header = ['序号', '门店编码', '门店名称', '平台', '销售额', '订单数', '客单价']
  const lines = [header.join(',')]
  for (const r of rows.value) {
    lines.push([
      r.seq == null ? '' : r.seq,
      r.storeCode,
      r.storeName,
      r.chnl,
      r.saleAmt,
      r.orderCnt,
      r.avgPrice
    ].map(v => `"${String(v === null || v === undefined ? '' : v).replace(/"/g, '""')}"`).join(','))
  }
  if (total.value) {
    lines.push([total.value.totalLabel || '线上外卖销售共计', '', '', '',
      total.value.saleAmt, total.value.orderCnt, total.value.avgPrice]
      .map(v => `"${String(v === null || v === undefined ? '' : v).replace(/"/g, '""')}"`).join(','))
  }
  // BOM 防 Excel 中文乱码
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `销售详情3_${queryForm.value.startDate}_${queryForm.value.endDate}.csv`
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
  /* 列数少，不占满整屏：整体宽度收窄三分之一（= 原来的 2/3），居中显示 */
  width: 66.67%;
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
.query-item select,
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
.query-item select { min-width: 120px; }
.query-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
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
  padding: 6px 18px;
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
  padding: 6px 18px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.btn-default:hover { border-color: #40a9ff; color: #1890ff; }
.btn-export {
  background: #52c41a;
  color: #fff;
  border: none;
  padding: 6px 18px;
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
/* 门店名称：居中显示；合并单元格时垂直居中 */
.col-name { text-align: center !important; vertical-align: middle; }
.col-seq { width: 60px; }
.col-code { width: 110px; }
.col-store { min-width: 220px; }
.col-chnl { width: 130px; }

/* 门店合计行（青色，与截图一致） */
.sales-table tr.subtotal td {
  background: #b8e0dc !important;
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
  font-weight: 700;
}
/* 总计行（暗黄，与截图一致） */
.sales-table tr.total td {
  background: #f2e1a6 !important;
  border-top: 2px solid #000;
  border-bottom: 3px double #000;
  font-weight: 800;
}
.empty-tip {
  padding: 24px;
  color: #999;
  font-size: 13px;
}
</style>

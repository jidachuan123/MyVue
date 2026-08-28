<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '../utils/request'

// ============================================================
// 销售详情2 —— 页面布局参考 测试.xlsx「各店每月最终取值」页签
// 数据来源：调用两遍后端接口 provider/sales/detail
//   ① 环比调用：cmpStartDate/cmpEndDate = 环比开始/结束 → 对期* 字段 = 环比值
//   ② 同比调用：cmpStartDate/cmpEndDate = 同比开始/结束 → 对期* 字段 = 同比值
// 映射规则（Excel「各店每月销售同环比」← 接口字段）：
//   销售额 ← 销售金额      毛利额 ← 含税毛利      来客数 ← 交易笔数
//   客单价/对期客单价 ← 公式(销售额÷来客数) 或 后端客单价/对期客单价
//   毛利率 ← 公式(毛利额÷销售额)
//   同比* ← 同比调用的 对期销售金额/对期含税毛利/对期交易笔数/对期客单价
//   环比* ← 环比调用的 对期销售金额/对期含税毛利/对期交易笔数/对期客单价
//   各增长率 ← 前端公式 (本期-对期)/对期
// 合计行：销售额/毛利额/来客数 = 组内各店求和；
//         客单价/毛利率/各增长率 按合计值用公式计算
// ============================================================

// ========== 默认查询日期（动态计算，不写死） ==========
// 规则：本期 = 当天的前一天；环比 = 当天的前两天（本期前一天）；同比 = 去年的今天
function fmtDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function defaultQueryForm() {
  const now = new Date()
  const prev = new Date(now); prev.setDate(now.getDate() - 1)      // 前一天 → 本期
  const prev2 = new Date(now); prev2.setDate(now.getDate() - 2)    // 前两天 → 环比
  const lastYear = new Date(now); lastYear.setFullYear(now.getFullYear() - 1) // 去年的今天 → 同比
  return {
    startDate: fmtDate(prev),      // 本期开始
    endDate: fmtDate(prev),        // 本期结束
    cmpStartDate: fmtDate(prev2),  // 环比对比开始
    cmpEndDate: fmtDate(prev2),    // 环比对比结束
    yoyStartDate: fmtDate(lastYear), // 同比对比开始
    yoyEndDate: fmtDate(lastYear),   // 同比对比结束
    orgCode: '1101,1102,1191001',  // 默认机构（1101 巨野组/1102 便利组/1191001），留空查全部
    deptLevels: '',               // 部门层级：留空=后端默认口径（正确，15,719）；1=超市；3=来客数翻倍(错)
    department: ''                // 部门编码：留空=后端默认口径（正确）；1=超市
  }
}

// ========== 查询参数（机构编码留空=全部机构） ==========
// 默认口径：部门层级/部门编码 留空不传（request.js 自动过滤空值，后端走默认口径，
//           便利组合计来客数=15,719 与 Excel 一致 —— 已验证 1101001=7,216）
// 注意：填 deptLevels=3 时接口返回多层部门明细，交易笔数会被重复统计（约翻倍），勿用
const queryForm = ref(defaultQueryForm())

// ========== API 数据 ==========
const apiLoading = ref(false)
const apiError = ref('')
const momData = ref(null)   // 环比调用结果（含本期值 + 环比对期值）
const yoyData = ref(null)   // 同比调用结果（含本期值 + 同比对期值）

async function fetchData() {
  apiLoading.value = true
  apiError.value = ''
  try {
    const base = {
      tenantId: '8',
      startDate: queryForm.value.startDate,
      endDate: queryForm.value.endDate,
      orgCode: queryForm.value.orgCode,
      showStore: '显示门店',
      deptLevels: queryForm.value.deptLevels,   // 留空则不发送（request.js 过滤空值，后端走默认口径）
      department: queryForm.value.department
    }
    // 环比调用：对比日期 = 环比开始/结束
    const momCmp = {
      cmpStartDate: queryForm.value.cmpStartDate,
      cmpEndDate: queryForm.value.cmpEndDate
    }
    // 同比调用：对比日期 = 同比开始/结束
    const yoyCmp = {
      cmpStartDate: queryForm.value.yoyStartDate,
      cmpEndDate: queryForm.value.yoyEndDate
    }
    const [momRes, yoyRes] = await Promise.all([
      request.get('/provider/sales/detail', { ...base, ...momCmp }),
      request.get('/provider/sales/detail', { ...base, ...yoyCmp })
    ])
    momData.value = momRes
    yoyData.value = yoyRes
  } catch (e) {
    apiError.value = '数据加载失败: ' + (e.message || '未知错误')
    momData.value = null
    yoyData.value = null
  } finally {
    apiLoading.value = false
  }
}

function resetForm() {
  queryForm.value = defaultQueryForm()
  momData.value = null
  yoyData.value = null
  apiError.value = ''
}

// ========== 发送日报（手动触发截图 + 邮件，使用当前页面查询条件） ==========
const sendingReport = ref(false)
async function sendReport() {
  if (!confirm('确定要生成「各店每月销售详情2」截图并发送邮件吗？\n将使用当前页面的查询条件（机构编码/部门层级/部门编码/日期）。')) {
    return
  }
  sendingReport.value = true
  try {
    const res = await request.post('/provider/sales/report/detail2/trigger', {
      orgCode: queryForm.value.orgCode,
      department: queryForm.value.department,
      deptLevels: queryForm.value.deptLevels,
      startDate: queryForm.value.startDate,
      endDate: queryForm.value.endDate,
      cmpStartDate: queryForm.value.cmpStartDate,
      cmpEndDate: queryForm.value.cmpEndDate,
      yoyStartDate: queryForm.value.yoyStartDate,
      yoyEndDate: queryForm.value.yoyEndDate
    })
    alert(res.result || '执行完成')
  } catch (err) {
    alert('发送失败：' + (err.message || '未知错误'))
  } finally {
    sendingReport.value = false
  }
}

onMounted(fetchData)

// ========== 数值辅助 ==========
function num(v) {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return isNaN(n) ? null : n
}
// 客单价 = 销售额 / 来客数（Excel: 客单价列 = 销售额/来客数，对期客单价 = 对期销售额/对期来客数）
function avgPriceOf(sales, customers) {
  const s = num(sales)
  const c = num(customers)
  if (s === null || c === null || c === 0) return null
  return Number((s / c).toFixed(2))
}
// 毛利率 = 毛利额 / 销售额（Excel: 毛利率列 = 毛利额/销售额）
function profitRateOf(profit, sales) {
  const p = num(profit)
  const s = num(sales)
  if (p === null || s === null || s === 0) return null
  return Number(((p / s) * 100).toFixed(2))
}
// 增长率 = (本期 - 对期) / 对期（Excel: =(C4-H4)/H4*100%）；对期为 0/空 → 空白
function rate(cur, prior) {
  const c = num(cur)
  const p = num(prior)
  if (c === null || p === null || p === 0) return null
  return Number(((c - p) / p * 100).toFixed(2))
}

// ========== 机构分组：按机构编码前四位归类（1101/1102/1103/1104…，前四位相同即同组） ==========
// 组顺序 = 前四位升序；每组组尾出合计行，合计行统一只叫「合计」（不带组名前缀）
function getGroup(code) {
  const s = String(code || '')
  return s.length >= 4 ? s.slice(0, 4) : (s || '其他')
}

// ========== 构建各店数据（按机构编码分组汇总） ==========
const storeRows = computed(() => {
  const mom = momData.value
  if (!mom || !mom.length) return []
  const yoy = yoyData.value || []

  // 同一机构可能返回多行（部门级明细），按机构编码求和得到「各店」数据
  // 本期值 + 环比对期值 从环比调用取；同比对期值 从同比调用取
  const map = new Map()
  const getItem = (code) => {
    const key = String(code)
    if (!map.has(key)) {
      map.set(key, {
        orgCode: code,
        orgName: '',
        sales: 0, profit: 0, customers: 0, stockAmount: 0, // 本期（含当日库存金额）
        momSales: 0, momProfit: 0, momCustomers: 0,        // 环比对期
        yoySales: 0, yoyProfit: 0, yoyCustomers: 0,        // 同比对期
        hasData: false,
        hasStock: false                                     // 库存是否已赋值（防 MOM/YOY 重复累加翻倍）
      })
    }
    return map.get(key)
  }

  for (const r of mom) {
    const code = r['机构编码']
    if (code === null || code === undefined || code === '') continue
    const it = getItem(code)
    if (!it.orgName) it.orgName = r['机构名称'] || ''
    it.sales += num(r['销售金额']) || 0
    it.profit += num(r['含税毛利']) || 0
    it.customers += num(r['交易笔数']) || 0
    it.stockAmount += num(r['当日库存金额']) || 0
    it.hasStock = true
    it.momSales += num(r['对期销售金额']) || 0
    it.momProfit += num(r['对期含税毛利']) || 0
    it.momCustomers += num(r['对期交易笔数']) || 0
    it.hasData = true
  }
  for (const r of yoy) {
    const code = r['机构编码']
    if (code === null || code === undefined || code === '') continue
    let it = map.get(String(code))
    if (!it) it = getItem(code)
    if (!it.orgName) it.orgName = r['机构名称'] || ''
    it.yoySales += num(r['对期销售金额']) || 0
    it.yoyProfit += num(r['对期含税毛利']) || 0
    it.yoyCustomers += num(r['对期交易笔数']) || 0
    // 当日库存金额 = 本期当天实时库存快照（与 cmp 无关）：仅当环比调用未返回该店时用同比返回的库存补上，
    // 已有库存则跳过，避免两个接口同一库存重复累加翻倍（与后端 SalesDetail2ReportService 同源）
    if (!it.hasStock) {
      it.stockAmount += num(r['当日库存金额']) || 0
      it.hasStock = true
    }
  }

  // 派生指标（公式计算）
  const rows = []
  for (const it of map.values()) {
    // 全 0 门店也占位显示：所有门店都保留在 rows 中参与合计与百分比计算；
    // 当日库存金额为 0 的门店仅在渲染层用 v-show 隐藏（不展示但参与计算，与后端截图服务同源）
    const avgPrice = avgPriceOf(it.sales, it.customers)
    const yoyAvgPrice = avgPriceOf(it.yoySales, it.yoyCustomers)
    const momAvgPrice = avgPriceOf(it.momSales, it.momCustomers)
    rows.push({
      ...it,
      group: getGroup(it.orgCode),
      avgPrice,
      yoyAvgPrice,
      momAvgPrice,
      profitRate: profitRateOf(it.profit, it.sales),
      yoySalesRate: rate(it.sales, it.yoySales),
      momSalesRate: rate(it.sales, it.momSales),
      yoyProfitRate: rate(it.profit, it.yoyProfit),
      momProfitRate: rate(it.profit, it.momProfit),
      yoyCustomerRate: rate(it.customers, it.yoyCustomers),
      momCustomerRate: rate(it.customers, it.momCustomers),
      yoyAvgPriceRate: rate(avgPrice, yoyAvgPrice),
      momAvgPriceRate: rate(avgPrice, momAvgPrice)
    })
  }
  // 按机构编码升序（前四位相同即同组，升序后同组自然连续）
  rows.sort((a, b) => String(a.orgCode).localeCompare(String(b.orgCode)))
  return rows
})

// ========== 合计行（Excel 合计逻辑：金额求和，派生指标按合计值公式） ==========
// 合计行统一只叫「合计」（用户要求：不带「巨野中心店组/便利组」等组名前缀）
function buildSubtotal(rows) {
  // 巨野便利店配送中心(1102911)为配送中心，不当门店，整行不进门店合计
  const calc = rows.filter(r => String(r.orgCode) !== '1102911')
  const sales = calc.reduce((s, r) => s + (num(r.sales) || 0), 0)
  const profit = calc.reduce((s, r) => s + (num(r.profit) || 0), 0)
  const customers = calc.reduce((s, r) => s + (num(r.customers) || 0), 0)
  const stockAmount = calc.reduce((s, r) => s + (num(r.stockAmount) || 0), 0)
  const yoySales = calc.reduce((s, r) => s + (num(r.yoySales) || 0), 0)
  const yoyProfit = calc.reduce((s, r) => s + (num(r.yoyProfit) || 0), 0)
  const yoyCustomers = calc.reduce((s, r) => s + (num(r.yoyCustomers) || 0), 0)
  const momSales = calc.reduce((s, r) => s + (num(r.momSales) || 0), 0)
  const momProfit = calc.reduce((s, r) => s + (num(r.momProfit) || 0), 0)
  const momCustomers = calc.reduce((s, r) => s + (num(r.momCustomers) || 0), 0)
  const avgPrice = avgPriceOf(sales, customers)
  const yoyAvgPrice = avgPriceOf(yoySales, yoyCustomers)
  const momAvgPrice = avgPriceOf(momSales, momCustomers)
  return {
    isSubtotal: true,
    orgCode: '',
    orgName: '合计',
    sales, profit, customers, stockAmount, avgPrice,
    profitRate: profitRateOf(profit, sales),
    yoySalesRate: rate(sales, yoySales),
    momSalesRate: rate(sales, momSales),
    yoyProfitRate: rate(profit, yoyProfit),
    momProfitRate: rate(profit, momProfit),
    yoyCustomerRate: rate(customers, yoyCustomers),
    momCustomerRate: rate(customers, momCustomers),
    yoyAvgPriceRate: rate(avgPrice, yoyAvgPrice),
    momAvgPriceRate: rate(avgPrice, momAvgPrice)
  }
}

// ========== 表格数据：按组（前四位）分段 + 组尾合计行 ==========
const tableData = computed(() => {
  const rows = storeRows.value
  if (!rows.length) return []
  const result = []
  // 组 = 出现过的前四位，升序排列（如 1101、1102、1103、1104、1191…）
  const groups = [...new Set(rows.map(r => r.group))].sort()
  for (const g of groups) {
    const grp = rows.filter(r => r.group === g)
    if (grp.length) {
      result.push(...grp)
      result.push(buildSubtotal(grp))
    }
  }
  return result
})

const loadedCount = computed(() => storeRows.value.length)

// ========== 格式化 ==========
function formatAmount(n) {
  if (n === undefined || n === null) return ''
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function formatInt(n) {
  if (n === undefined || n === null) return ''
  return Number(n).toLocaleString('zh-CN')
}
function formatRate(v) {
  if (v === undefined || v === null) return ''
  const prefix = v > 0 ? '+' : ''
  return prefix + Number(v).toFixed(2) + '%'
}
function formatPct(v) {
  if (v === undefined || v === null) return ''
  return Number(v).toFixed(2) + '%'
}
function getRateClass(v) {
  if (v === undefined || v === null) return ''
  if (v > 0) return 'rate-up'
  if (v < 0) return 'rate-down'
  return ''
}

// ========== 导出 Excel (CSV) ==========
function exportExcel() {
  const headers = [
    '机构代码', '机构名称', '当日库存金额', '销售额/元', '同比销售额增长率', '环比销售额增长率',
    '毛利额/元', '同比毛利额增长率', '环比毛利额增长率', '毛利率',
    '来客数', '同比来客数增长率', '环比来客数增长率',
    '客单价/元', '同比客单价增长率', '环比客单价增长率'
  ]
  let csv = '\uFEFF' + headers.join(',') + '\n'
  for (const row of tableData.value) {
    const values = [
      row.orgCode, row.orgName, row.stockAmount, row.sales,
      formatRate(row.yoySalesRate), formatRate(row.momSalesRate),
      row.profit, formatRate(row.yoyProfitRate), formatRate(row.momProfitRate),
      formatPct(row.profitRate),
      row.customers, formatRate(row.yoyCustomerRate), formatRate(row.momCustomerRate),
      row.avgPrice, formatRate(row.yoyAvgPriceRate), formatRate(row.momAvgPriceRate)
    ]
    csv += values.map(v => {
      const s = String(v || '')
      if (s.includes(',') || s.includes('\n') || s.includes('"')) {
        return '"' + s.replace(/"/g, '""') + '"'
      }
      return s
    }).join(',') + '\n'
  }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '各店每月销售详情_' + queryForm.value.endDate + '.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}
</script>

<template>
  <div class="sales-detail-page">
    <!-- 标题区域 -->
    <div class="page-header">
      <h2>各店每月销售详情</h2>
      <div class="date-info">
        <span class="tag current">本期：{{ queryForm.startDate }} ~ {{ queryForm.endDate }}</span>
        <span class="tag compare">同比：{{ queryForm.yoyStartDate }} ~ {{ queryForm.yoyEndDate }}</span>
        <span class="tag compare">环比：{{ queryForm.cmpStartDate }} ~ {{ queryForm.cmpEndDate }}</span>
        <span v-if="momData" class="tag loaded">已加载 {{ loadedCount }} 家门店</span>
      </div>
    </div>

    <!-- 查询区域（参考销售详情，不变） -->
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
          <label>环比开始:</label>
          <input type="date" v-model="queryForm.cmpStartDate" />
        </div>
        <div class="query-item">
          <label>环比结束:</label>
          <input type="date" v-model="queryForm.cmpEndDate" />
        </div>
        <div class="query-item">
          <label>同比开始:</label>
          <input type="date" v-model="queryForm.yoyStartDate" />
        </div>
        <div class="query-item">
          <label>同比结束:</label>
          <input type="date" v-model="queryForm.yoyEndDate" />
        </div>
        <div class="query-item">
          <label>机构编码:</label>
          <input type="text" v-model="queryForm.orgCode" placeholder="留空查全部" style="width:130px" />
        </div>
        <div class="query-item">
          <label>部门层级:</label>
          <input type="text" v-model="queryForm.deptLevels" placeholder="留空=默认" style="width:80px" />
        </div>
        <div class="query-item">
          <label>部门编码:</label>
          <input type="text" v-model="queryForm.department" placeholder="留空=默认，1=超市" style="width:110px" />
        </div>
        <div class="query-actions">
          <button class="btn-primary" @click="fetchData" :disabled="apiLoading">
            {{ apiLoading ? '查询中...' : '查询' }}
          </button>
          <button class="btn-default" @click="resetForm">重置</button>
          <button class="btn-report" @click="sendReport" :disabled="sendingReport">
            {{ sendingReport ? '发送中...' : '发送日报' }}
          </button>
          <button class="btn-export" @click="exportExcel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            导出Excel
          </button>
        </div>
      </div>
      <div class="query-error" v-if="apiError">{{ apiError }}</div>
    </div>

    <!-- 表格：各店每月最终取值 15 列 -->
    <div class="table-wrapper">
      <table class="sales-table">
        <thead>
          <tr>
            <th class="col-code">机构代码</th>
            <th class="col-org">机构名称</th>
            <th class="col-num col-stock">当日库存金额</th>
            <th class="col-num col-sales">销售额/元</th>
            <th class="col-rate col-sales">同比<br>销售额增长率</th>
            <th class="col-rate col-sales">环比<br>销售额增长率</th>
            <th class="col-num col-profit">毛利额/元</th>
            <th class="col-rate col-profit">同比<br>毛利额增长率</th>
            <th class="col-rate col-profit">环比<br>毛利额增长率</th>
            <th class="col-num col-profit">毛利率</th>
            <th class="col-num col-customer">来客数</th>
            <th class="col-rate col-customer">同比<br>来客数增长率</th>
            <th class="col-rate col-customer">环比<br>来客数增长率</th>
            <th class="col-num col-price">客单价/元</th>
            <th class="col-rate col-price">同比<br>客单价增长率</th>
            <th class="col-rate col-price">环比<br>客单价增长率</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, idx) in tableData" :key="idx">
            <!-- 合计行 -->
            <tr v-if="row.isSubtotal" class="subtotal">
              <td class="col-code"></td>
              <td class="col-org subtotal-label">{{ row.orgName }}</td>
              <td class="col-num col-stock">{{ formatAmount(row.stockAmount) }}</td>
              <td class="col-num col-sales">{{ formatAmount(row.sales) }}</td>
              <td :class="['col-rate', 'col-sales', getRateClass(row.yoySalesRate)]">{{ formatRate(row.yoySalesRate) }}</td>
              <td :class="['col-rate', 'col-sales', getRateClass(row.momSalesRate)]">{{ formatRate(row.momSalesRate) }}</td>
              <td class="col-num col-profit">{{ formatAmount(row.profit) }}</td>
              <td :class="['col-rate', 'col-profit', getRateClass(row.yoyProfitRate)]">{{ formatRate(row.yoyProfitRate) }}</td>
              <td :class="['col-rate', 'col-profit', getRateClass(row.momProfitRate)]">{{ formatRate(row.momProfitRate) }}</td>
              <td class="col-num col-profit">{{ formatPct(row.profitRate) }}</td>
              <td class="col-num col-customer">{{ formatInt(row.customers) }}</td>
              <td :class="['col-rate', 'col-customer', getRateClass(row.yoyCustomerRate)]">{{ formatRate(row.yoyCustomerRate) }}</td>
              <td :class="['col-rate', 'col-customer', getRateClass(row.momCustomerRate)]">{{ formatRate(row.momCustomerRate) }}</td>
              <td class="col-num col-price">{{ formatAmount(row.avgPrice) }}</td>
              <td :class="['col-rate', 'col-price', getRateClass(row.yoyAvgPriceRate)]">{{ formatRate(row.yoyAvgPriceRate) }}</td>
              <td :class="['col-rate', 'col-price', getRateClass(row.momAvgPriceRate)]">{{ formatRate(row.momAvgPriceRate) }}</td>
            </tr>
            <!-- 各店行：库存=0 的门店隐藏（v-show，仍参与合计计算） -->
            <tr v-else v-show="row.stockAmount > 0" :class="{ 'odd': idx % 2 === 1 }">
              <td class="col-code">{{ row.orgCode }}</td>
              <td class="col-org">{{ row.orgName }}</td>
              <td class="col-num col-stock">{{ formatAmount(row.stockAmount) }}</td>
              <td class="col-num col-sales">{{ formatAmount(row.sales) }}</td>
              <td :class="['col-rate', 'col-sales', getRateClass(row.yoySalesRate)]">{{ formatRate(row.yoySalesRate) }}</td>
              <td :class="['col-rate', 'col-sales', getRateClass(row.momSalesRate)]">{{ formatRate(row.momSalesRate) }}</td>
              <td class="col-num col-profit">{{ formatAmount(row.profit) }}</td>
              <td :class="['col-rate', 'col-profit', getRateClass(row.yoyProfitRate)]">{{ formatRate(row.yoyProfitRate) }}</td>
              <td :class="['col-rate', 'col-profit', getRateClass(row.momProfitRate)]">{{ formatRate(row.momProfitRate) }}</td>
              <td class="col-num col-profit">{{ formatPct(row.profitRate) }}</td>
              <td class="col-num col-customer">{{ formatInt(row.customers) }}</td>
              <td :class="['col-rate', 'col-customer', getRateClass(row.yoyCustomerRate)]">{{ formatRate(row.yoyCustomerRate) }}</td>
              <td :class="['col-rate', 'col-customer', getRateClass(row.momCustomerRate)]">{{ formatRate(row.momCustomerRate) }}</td>
              <td class="col-num col-price">{{ formatAmount(row.avgPrice) }}</td>
              <td :class="['col-rate', 'col-price', getRateClass(row.yoyAvgPriceRate)]">{{ formatRate(row.yoyAvgPriceRate) }}</td>
              <td :class="['col-rate', 'col-price', getRateClass(row.momAvgPriceRate)]">{{ formatRate(row.momAvgPriceRate) }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.sales-detail-page {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  font-size: 13px;
  color: #333;
}

/* 标题 */
.page-header {
  text-align: center;
  padding: 20px 16px 12px;
  border-bottom: 1px solid #e8e8e8;
  background: linear-gradient(135deg, #fff8e1 0%, #fffde7 100%);
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
.tag.current {
  background: #e3f2fd;
  color: #1565c0;
}
.tag.compare {
  background: #fff3e0;
  color: #e65100;
}
.tag.loaded {
  background: #e8f5e9;
  color: #2e7d32;
}

/* 查询 */
.query-panel {
  padding: 14px 20px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
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
.query-item input[type="date"],
.query-item input[type="text"] {
  padding: 5px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  background: #fff;
}
.query-item input[type="date"] {
  width: 130px;
}
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
  transition: background .2s;
}
.btn-primary:hover { background: #40a9ff; }
.btn-primary:disabled { background: #91caff; cursor: not-allowed; }
.btn-default {
  background: #fff;
  color: #555;
  border: 1px solid #d9d9d9;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all .2s;
}
.btn-default:hover { border-color: #1890ff; color: #1890ff; }
.btn-export {
  background: #52c41a;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background .2s;
}
.btn-export:hover { background: #73d13d; }
.btn-report {
  background: #fa8c16;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background .2s;
}
.btn-report:hover { background: #ffa940; }
.btn-report:disabled { background: #ffc069; cursor: not-allowed; }

/* 表格 */
.table-wrapper {
  overflow-x: auto;
  padding: 0;
}
.sales-table {
  width: 100%;
  min-width: 1800px;
  border-collapse: collapse;
  font-size: 12px;
}
.sales-table thead th {
  font-weight: 600;
  padding: 8px 6px;
  border: 2px solid #8c8c8c;
  text-align: center;
  white-space: nowrap;
  background: #f5f5f5;
  color: #333;
  position: sticky;
  top: 0;
  z-index: 10;
}
.sales-table tbody td {
  padding: 7px 6px;
  border: 1.5px solid #bfbfbf;
  text-align: center;
}
.sales-table tbody tr:hover {
  background: #e3f2fd;
}
.sales-table tbody tr.odd {
  background: #fafafa;
}
.sales-table tbody tr.odd:hover {
  background: #e3f2fd;
}

/* 列宽 */
.col-code { min-width: 90px; }
.col-org { min-width: 200px; }
.col-num { min-width: 85px; text-align: center !important; font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif; }
.col-rate { min-width: 70px; }

/* 列分组颜色 */
.col-sales { background: #fff3e0 !important; }
.col-profit { background: #e8f5e9 !important; }
.col-customer { background: #e3f2fd !important; }
.col-price { background: #fce4ec !important; }
.col-stock { background: #f3e5f5 !important; }

/* 合计行 */
.subtotal {
  background: linear-gradient(90deg, #fff59d 0%, #fff9c4 100%) !important;
  font-weight: 700;
}
.subtotal td {
  border-top: 2px solid #f57f17 !important;
  border-bottom: 2px solid #f57f17 !important;
  color: #4e342e !important;
}
.subtotal:hover {
  background: linear-gradient(90deg, #fff176 0%, #fff59d 100%) !important;
}
.subtotal-label {
  font-weight: 700;
  letter-spacing: 1px;
}

/* 增长率颜色（中国惯例：涨红跌绿） */
.rate-up {
  color: #d32f2f;
  font-weight: 500;
}
.rate-down {
  color: #388e3c;
  font-weight: 500;
}
</style>

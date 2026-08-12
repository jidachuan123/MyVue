<script setup>
import { ref, computed } from 'vue'
import request from '../utils/request'

// ========== 同比/环比列显隐开关 ==========
const showYoY = ref(true)
const showMoM = ref(true)

// ========== 查询参数（用户输入，不写死） ==========
const queryForm = ref({
  startDate: '2026-08-10',
  endDate: '2026-08-10',
  cmpStartDate: '2026-08-11',
  cmpEndDate: '2026-08-11',
  orgCode: '1101001'
})
const deptGroupFilter = ref('')

// ========== API 数据 ==========
const apiData = ref(null)
const apiLoading = ref(false)
const apiError = ref('')

async function fetchData() {
  apiLoading.value = true
  apiError.value = ''
  try {
    const res = await request.get('/provider/sales/detail', {
      tenantId: '8',
      startDate: queryForm.value.startDate,
      endDate: queryForm.value.endDate,
      cmpStartDate: queryForm.value.cmpStartDate,
      cmpEndDate: queryForm.value.cmpEndDate,
      orgCode: queryForm.value.orgCode,
      deptLevels: '3',
      showStore: '显示门店'
    })
    apiData.value = res
  } catch (e) {
    apiError.value = '数据加载失败: ' + (e.message || '未知错误')
    apiData.value = null
  } finally {
    apiLoading.value = false
  }
}

function resetForm() {
  queryForm.value = {
    startDate: '2026-08-10',
    endDate: '2026-08-10',
    cmpStartDate: '2026-08-11',
    cmpEndDate: '2026-08-11',
    orgCode: '1101001'
  }
  deptGroupFilter.value = ''
  apiData.value = null
  apiError.value = ''
}

// ========== 写死数据（后面逐步替换） ==========
const rawData = [
  // 生鲜一部
  { orgName: '菏泽佳和城店超市', deptGroup: '生鲜一部', deptCode: '1101', deptName: '蔬菜组',
    salesAmount: 26626.26, salesYoY: 12.35, salesMoM: -3.21,
    profitAmount: 5876.50, profitYoY: 18.22, profitMoM: 2.15,
    profitRate: 22.07, customers: 8450, customerYoY: 8.50, customerMoM: -1.80,
    avgPrice: 3151, avgPriceYoY: 3.55, avgPriceMoM: -1.44 },
  { orgName: '菏泽佳和城店超市', deptGroup: '生鲜一部', deptCode: '1102', deptName: '水果组',
    salesAmount: 65663.37, salesYoY: 15.80, salesMoM: 5.62,
    profitAmount: 14102.80, profitYoY: 21.50, profitMoM: 8.30,
    profitRate: 21.48, customers: 12100, customerYoY: 10.20, customerMoM: 4.15,
    avgPrice: 5427, avgPriceYoY: 5.08, avgPriceMoM: 1.41 },
  { orgName: '菏泽佳和城店超市', deptGroup: '生鲜一部', deptCode: '1103', deptName: '肉品组',
    salesAmount: 89210.55, salesYoY: 8.90, salesMoM: -1.50,
    profitAmount: 19876.20, profitYoY: 11.30, profitMoM: 1.20,
    profitRate: 22.28, customers: 15240, customerYoY: 6.80, customerMoM: -2.10,
    avgPrice: 5854, avgPriceYoY: 1.97, avgPriceMoM: 0.61 },
  { orgName: '菏泽佳和城店超市', deptGroup: '生鲜一部', deptCode: '1104', deptName: '水产组',
    salesAmount: 32150.88, salesYoY: 6.45, salesMoM: -4.80,
    profitAmount: 7120.35, profitYoY: 9.10, profitMoM: -2.50,
    profitRate: 22.15, customers: 6320, customerYoY: 4.30, customerMoM: -3.50,
    avgPrice: 5087, avgPriceYoY: 2.06, avgPriceMoM: -1.35 },
  { orgName: '菏泽佳和城店超市', deptGroup: '生鲜一部', deptCode: '1105', deptName: '熟食组',
    salesAmount: 45870.20, salesYoY: 14.20, salesMoM: 3.80,
    profitAmount: 13520.60, profitYoY: 17.80, profitMoM: 5.20,
    profitRate: 29.48, customers: 9840, customerYoY: 11.50, customerMoM: 2.50,
    avgPrice: 4662, avgPriceYoY: 2.42, avgPriceMoM: 1.27 },
  { orgName: '菏泽佳和城店超市', deptGroup: '生鲜一部', deptCode: '1106', deptName: '烘焙组',
    salesAmount: 38120.45, salesYoY: 22.50, salesMoM: 8.60,
    profitAmount: 15230.80, profitYoY: 25.60, profitMoM: 10.20,
    profitRate: 39.95, customers: 7650, customerYoY: 18.30, customerMoM: 6.50,
    avgPrice: 4983, avgPriceYoY: 3.55, avgPriceMoM: 1.97 },
  // 生鲜二部
  { orgName: '菏泽佳和城店超市', deptGroup: '生鲜二部', deptCode: '1201', deptName: '乳品组',
    salesAmount: 52340.66, salesYoY: 10.80, salesMoM: 2.15,
    profitAmount: 10468.13, profitYoY: 12.50, profitMoM: 3.20,
    profitRate: 20.00, customers: 10230, customerYoY: 8.40, customerMoM: 1.80,
    avgPrice: 5116, avgPriceYoY: 2.22, avgPriceMoM: 0.34 },
  { orgName: '菏泽佳和城店超市', deptGroup: '生鲜二部', deptCode: '1202', deptName: '冷冻组',
    salesAmount: 28760.30, salesYoY: 5.60, salesMoM: -2.30,
    profitAmount: 6850.50, profitYoY: 7.80, profitMoM: -1.10,
    profitRate: 23.82, customers: 5890, customerYoY: 3.50, customerMoM: -1.60,
    avgPrice: 4883, avgPriceYoY: 2.03, avgPriceMoM: -0.71 },
  { orgName: '菏泽佳和城店超市', deptGroup: '生鲜二部', deptCode: '1203', deptName: '蛋品组',
    salesAmount: 19850.40, salesYoY: 8.20, salesMoM: 1.05,
    profitAmount: 3952.20, profitYoY: 10.30, profitMoM: 2.50,
    profitRate: 19.91, customers: 6720, customerYoY: 6.10, customerMoM: 0.80,
    avgPrice: 2954, avgPriceYoY: 1.98, avgPriceMoM: 0.25 },
  { orgName: '菏泽佳和城店超市', deptGroup: '生鲜二部', deptCode: '1204', deptName: '豆制品组',
    salesAmount: 15620.88, salesYoY: 7.10, salesMoM: -0.85,
    profitAmount: 3580.40, profitYoY: 8.90, profitMoM: -0.50,
    profitRate: 22.92, customers: 5340, customerYoY: 5.20, customerMoM: -0.30,
    avgPrice: 2925, avgPriceYoY: 1.81, avgPriceMoM: -0.55 },
  // 食品部
  { orgName: '菏泽佳和城店超市', deptGroup: '食品部', deptCode: '1301', deptName: '休闲食品组',
    salesAmount: 35680.50, salesYoY: 9.50, salesMoM: 3.20,
    profitAmount: 8920.13, profitYoY: 11.20, profitMoM: 4.50,
    profitRate: 25.00, customers: 8960, customerYoY: 7.30, customerMoM: 2.50,
    avgPrice: 3982, avgPriceYoY: 2.05, avgPriceMoM: 0.68 },
  { orgName: '菏泽佳和城店超市', deptGroup: '食品部', deptCode: '1302', deptName: '酒饮组',
    salesAmount: 48230.75, salesYoY: 13.60, salesMoM: 5.10,
    profitAmount: 14469.23, profitYoY: 15.80, profitMoM: 6.20,
    profitRate: 30.00, customers: 7840, customerYoY: 10.50, customerMoM: 4.20,
    avgPrice: 6152, avgPriceYoY: 2.81, avgPriceMoM: 0.86 },
  { orgName: '菏泽佳和城店超市', deptGroup: '食品部', deptCode: '1303', deptName: '调味品组',
    salesAmount: 29850.20, salesYoY: 6.80, salesMoM: 1.50,
    profitAmount: 7172.05, profitYoY: 8.50, profitMoM: 2.10,
    profitRate: 24.03, customers: 7650, customerYoY: 5.40, customerMoM: 1.20,
    avgPrice: 3902, avgPriceYoY: 1.33, avgPriceMoM: 0.30 },
  { orgName: '菏泽佳和城店超市', deptGroup: '食品部', deptCode: '1304', deptName: '粮油组',
    salesAmount: 41230.60, salesYoY: 4.20, salesMoM: 0.80,
    profitAmount: 5438.25, profitYoY: 3.50, profitMoM: -1.10,
    profitRate: 13.19, customers: 6230, customerYoY: 2.80, customerMoM: 0.30,
    avgPrice: 6618, avgPriceYoY: 1.36, avgPriceMoM: 0.50 },
  { orgName: '菏泽佳和城店超市', deptGroup: '食品部', deptCode: '1305', deptName: '冲调组',
    salesAmount: 22340.30, salesYoY: 11.30, salesMoM: 3.80,
    profitAmount: 5585.08, profitYoY: 12.40, profitMoM: 4.50,
    profitRate: 25.00, customers: 5840, customerYoY: 8.60, customerMoM: 2.80,
    avgPrice: 3825, avgPriceYoY: 2.49, avgPriceMoM: 0.97 },
  { orgName: '菏泽佳和城店超市', deptGroup: '食品部', deptCode: '1306', deptName: '进口食品组',
    salesAmount: 18760.45, salesYoY: 25.60, salesMoM: 8.90,
    profitAmount: 6570.16, profitYoY: 28.50, profitMoM: 10.50,
    profitRate: 35.02, customers: 4120, customerYoY: 22.30, customerMoM: 7.50,
    avgPrice: 4553, avgPriceYoY: 2.70, avgPriceMoM: 1.30 },
  // 非食部
  { orgName: '菏泽佳和城店超市', deptGroup: '非食部', deptCode: '1501', deptName: '日用品组',
    salesAmount: 35890.60, salesYoY: 5.80, salesMoM: -2.10,
    profitAmount: 10767.18, profitYoY: 6.50, profitMoM: -1.50,
    profitRate: 30.00, customers: 6780, customerYoY: 4.20, customerMoM: -1.80,
    avgPrice: 5294, avgPriceYoY: 1.54, avgPriceMoM: -0.31 },
  { orgName: '菏泽佳和城店超市', deptGroup: '非食部', deptCode: '1502', deptName: '家纺组',
    salesAmount: 22840.20, salesYoY: -1.20, salesMoM: -5.30,
    profitAmount: 6852.06, profitYoY: -2.50, profitMoM: -6.10,
    profitRate: 30.00, customers: 3250, customerYoY: -3.10, customerMoM: -4.50,
    avgPrice: 7028, avgPriceYoY: 1.96, avgPriceMoM: -0.84 },
  { orgName: '菏泽佳和城店超市', deptGroup: '非食部', deptCode: '1503', deptName: '文体组',
    salesAmount: 15320.80, salesYoY: 3.50, salesMoM: -1.80,
    profitAmount: 4596.24, profitYoY: 4.20, profitMoM: -0.90,
    profitRate: 30.00, customers: 4120, customerYoY: 2.80, customerMoM: -1.20,
    avgPrice: 3719, avgPriceYoY: 0.68, avgPriceMoM: -0.61 },
]

// ========== 辅助函数 ==========
function sum(rows, field) {
  return rows.reduce((s, r) => s + (Number(r[field]) || 0), 0)
}
function priorValue(current, rate) {
  if (rate == null) return current
  return current / (1 + rate / 100)
}
function calcRate(curSum, priorSum) {
  if (!priorSum || priorSum === 0) return 0
  return Number((((curSum - priorSum) / Math.abs(priorSum)) * 100).toFixed(2))
}

// ========== 合并数据源：API 返回后，按位置依次覆盖 4 列 ==========
// 按部门编码前2位推导部组名称（确保 tableData 的分组过滤不受 API 机构名称影响）
function getDeptGroup(code) {
  if (!code) return ''
  const prefix = String(code).substring(0, 2)
  const map = { '11': '生鲜一部', '12': '生鲜二部', '13': '食品部', '15': '非食部' }
  return map[prefix] || ''
}

const sourceData = computed(() => {
  const api = apiData.value
  if (!api || !api.length) return rawData
  return rawData.map((row, i) => {
    const ar = api[i]
    if (!ar) return row
    return {
      ...row,
      // API字段映射到前端列：机构名称→机构名称，部门编码3→部门编码，部门名称3→部门名称
      // 部组名称由部门编码前缀推导（不受API字段影响，否则所有行部组相同）
      orgName: ar['机构名称'] ?? row.orgName,
      deptGroup: getDeptGroup(ar['部门编码3']) || row.deptGroup,
      deptCode: ar['部门编码3'] ?? row.deptCode,
      deptName: ar['部门名称3'] ?? row.deptName,
    }
  })
})

// ========== 构建表格数据（含小计和总计） ==========
const tableData = computed(() => {
  const groups = ['生鲜一部', '生鲜二部', '食品部', '非食部']
  const data = sourceData.value
  const result = []

  for (const g of groups) {
    const rows = data.filter(r => r.deptGroup === g)
    if (!rows.length) continue
    result.push(...rows)

    // ── 本期合计 ──
    const curSales = sum(rows, 'salesAmount')
    const curProfit = sum(rows, 'profitAmount')
    const curCustomers = sum(rows, 'customers')

    // ── 反推同期基值并汇总 ──
    const priorYoY = { sales: 0, profit: 0, customers: 0 }
    const priorMoM = { sales: 0, profit: 0, customers: 0 }
    for (const r of rows) {
      priorYoY.sales    += priorValue(r.salesAmount, r.salesYoY)
      priorYoY.profit   += priorValue(r.profitAmount, r.profitYoY)
      priorYoY.customers += priorValue(r.customers, r.customerYoY)
      priorMoM.sales    += priorValue(r.salesAmount, r.salesMoM)
      priorMoM.profit   += priorValue(r.profitAmount, r.profitMoM)
      priorMoM.customers += priorValue(r.customers, r.customerMoM)
    }

    // ── 派生指标 ──
    const profitRate = curSales > 0 ? Number(((curProfit / curSales) * 100).toFixed(2)) : 0
    const avgPrice = curCustomers > 0 ? Math.round(curSales / curCustomers) : 0

    // ── 同比/环比增长率 ──
    const salesYoY    = calcRate(curSales, priorYoY.sales)
    const salesMoM    = calcRate(curSales, priorMoM.sales)
    const profitYoY   = calcRate(curProfit, priorYoY.profit)
    const profitMoM   = calcRate(curProfit, priorMoM.profit)
    const customerYoY = calcRate(curCustomers, priorYoY.customers)
    const customerMoM = calcRate(curCustomers, priorMoM.customers)
    const priorAvgPriceYoY = priorYoY.customers > 0 ? (priorYoY.sales / priorYoY.customers) : 0
    const priorAvgPriceMoM = priorMoM.customers > 0 ? (priorMoM.sales / priorMoM.customers) : 0
    const avgPriceYoY = priorAvgPriceYoY > 0 ? calcRate(avgPrice, priorAvgPriceYoY) : 0
    const avgPriceMoM = priorAvgPriceMoM > 0 ? calcRate(avgPrice, priorAvgPriceMoM) : 0

    result.push({
      orgName: '', deptGroup: '', deptCode: '', deptName: `${g} 合计`,
      salesAmount: curSales, salesYoY, salesMoM,
      profitAmount: curProfit, profitYoY, profitMoM,
      profitRate, customers: curCustomers, customerYoY, customerMoM,
      avgPrice, avgPriceYoY, avgPriceMoM,
      isSubtotal: true
    })
  }

  // ── 总计行（取明细行汇总，不含小计行） ──
  const allDetail = result.filter(r => !r.isSubtotal)
  const tSales = sum(allDetail, 'salesAmount')
  const tProfit = sum(allDetail, 'profitAmount')
  const tCustomers = sum(allDetail, 'customers')

  const tPriorYoY = { sales: 0, profit: 0, customers: 0 }
  const tPriorMoM = { sales: 0, profit: 0, customers: 0 }
  for (const r of allDetail) {
    tPriorYoY.sales    += priorValue(r.salesAmount, r.salesYoY)
    tPriorYoY.profit   += priorValue(r.profitAmount, r.profitYoY)
    tPriorYoY.customers += priorValue(r.customers, r.customerYoY)
    tPriorMoM.sales    += priorValue(r.salesAmount, r.salesMoM)
    tPriorMoM.profit   += priorValue(r.profitAmount, r.profitMoM)
    tPriorMoM.customers += priorValue(r.customers, r.customerMoM)
  }

  const tProfitRate = tSales > 0 ? Number(((tProfit / tSales) * 100).toFixed(2)) : 0
  const tAvgPrice = tCustomers > 0 ? Math.round(tSales / tCustomers) : 0

  const tSalesYoY    = calcRate(tSales, tPriorYoY.sales)
  const tSalesMoM    = calcRate(tSales, tPriorMoM.sales)
  const tProfitYoY   = calcRate(tProfit, tPriorYoY.profit)
  const tProfitMoM   = calcRate(tProfit, tPriorMoM.profit)
  const tCustomerYoY = calcRate(tCustomers, tPriorYoY.customers)
  const tCustomerMoM = calcRate(tCustomers, tPriorMoM.customers)
  const tPriorAvgPriceYoY = tPriorYoY.customers > 0 ? (tPriorYoY.sales / tPriorYoY.customers) : 0
  const tPriorAvgPriceMoM = tPriorMoM.customers > 0 ? (tPriorMoM.sales / tPriorMoM.customers) : 0
  const tAvgPriceYoY = tPriorAvgPriceYoY > 0 ? calcRate(tAvgPrice, tPriorAvgPriceYoY) : 0
  const tAvgPriceMoM = tPriorAvgPriceMoM > 0 ? calcRate(tAvgPrice, tPriorAvgPriceMoM) : 0

  result.push({
    orgName: '', deptGroup: '', deptCode: '', deptName: '超市总计',
    salesAmount: tSales, salesYoY: tSalesYoY, salesMoM: tSalesMoM,
    profitAmount: tProfit, profitYoY: tProfitYoY, profitMoM: tProfitMoM,
    profitRate: tProfitRate, customers: tCustomers, customerYoY: tCustomerYoY, customerMoM: tCustomerMoM,
    avgPrice: tAvgPrice, avgPriceYoY: tAvgPriceYoY, avgPriceMoM: tAvgPriceMoM,
    isTotal: true
  })

  return result
})

// ========== 格式化 ==========
function formatAmount(n) {
  if (n === undefined || n === null) return ''
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function formatRate(val) {
  if (val === undefined || val === null) return '-'
  const prefix = val > 0 ? '+' : ''
  return prefix + Number(val).toFixed(2) + '%'
}
function getRateClass(val) {
  if (val === undefined || val === null) return ''
  if (val > 0) return 'rate-up'
  if (val < 0) return 'rate-down'
  return ''
}

// ========== 导出 Excel (CSV) ==========
function exportExcel() {
  let headers = [
    '机构名称', '部组名称', '部门编码', '部门名称',
    '销售额/元'
  ]
  if (showYoY.value) headers.push('同比销售额增长率')
  if (showMoM.value) headers.push('环比销售额增长率')
  headers.push('毛利额/元')
  if (showYoY.value) headers.push('同比毛利额增长率')
  if (showMoM.value) headers.push('环比毛利额增长率')
  headers.push('毛利率', '来客数')
  if (showYoY.value) headers.push('同比来客数增长率')
  if (showMoM.value) headers.push('环比来客数增长率')
  headers.push('客单价/元')
  if (showYoY.value) headers.push('同比客单价增长率')
  if (showMoM.value) headers.push('环比客单价增长率')

  let csv = '\uFEFF' + headers.join(',') + '\n'

  for (const row of tableData.value) {
    let values = [
      row.orgName, row.deptGroup, row.deptCode, row.deptName,
      row.salesAmount
    ]
    if (showYoY.value) values.push(formatRate(row.salesYoY))
    if (showMoM.value) values.push(formatRate(row.salesMoM))
    values.push(row.profitAmount)
    if (showYoY.value) values.push(formatRate(row.profitYoY))
    if (showMoM.value) values.push(formatRate(row.profitMoM))
    values.push(row.profitRate + '%', row.customers)
    if (showYoY.value) values.push(formatRate(row.customerYoY))
    if (showMoM.value) values.push(formatRate(row.customerMoM))
    values.push(row.avgPrice)
    if (showYoY.value) values.push(formatRate(row.avgPriceYoY))
    if (showMoM.value) values.push(formatRate(row.avgPriceMoM))

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
  link.download = '销售详情_2026-08-10.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}
</script>

<template>
  <div class="sales-detail-page">
    <!-- 标题区域 -->
    <div class="page-header">
      <h2>部门销售详情</h2>
      <div class="date-info">
        <span class="tag current">查询日期：{{ queryForm.startDate }} ~ {{ queryForm.endDate }}</span>
        <span v-if="apiData" class="tag loaded">已加载 {{ apiData.length }} 条API数据</span>
      </div>
      <div class="toggle-row">
        <label class="toggle-item">
          <input type="checkbox" v-model="showYoY" /> 显示同比
        </label>
        <label class="toggle-item">
          <input type="checkbox" v-model="showMoM" /> 显示环比
        </label>
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
          <label>同比开始:</label>
          <input type="date" v-model="queryForm.cmpStartDate" />
        </div>
        <div class="query-item">
          <label>同比结束:</label>
          <input type="date" v-model="queryForm.cmpEndDate" />
        </div>
        <div class="query-item">
          <label>机构编码:</label>
          <input type="text" v-model="queryForm.orgCode" placeholder="如 1101001" style="width:100px" />
        </div>
        <div class="query-item">
          <label>部组名称:</label>
          <select v-model="deptGroupFilter">
            <option value="">全部</option>
            <option>生鲜一部</option>
            <option>生鲜二部</option>
            <option>食品部</option>
            <option>非食部</option>
          </select>
        </div>
        <div class="query-actions">
          <button class="btn-primary" @click="fetchData" :disabled="apiLoading">
            {{ apiLoading ? '查询中...' : '查询' }}
          </button>
          <button class="btn-default" @click="resetForm">重置</button>
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

    <!-- 表格 -->
    <div class="table-wrapper">
      <table class="sales-table">
        <thead>
          <tr>
            <th class="col-org">机构名称</th>
            <th class="col-group">部组名称</th>
            <th class="col-code">部门编码</th>
            <th class="col-name">部门名称</th>
            <th class="col-num col-sales">销售额/元</th>
            <th class="col-rate col-sales" v-if="showYoY">同比<br>销售额增长率</th>
            <th class="col-rate col-sales" v-if="showMoM">环比<br>销售额增长率</th>
            <th class="col-num col-profit">毛利额/元</th>
            <th class="col-rate col-profit" v-if="showYoY">同比<br>毛利额增长率</th>
            <th class="col-rate col-profit" v-if="showMoM">环比<br>毛利额增长率</th>
            <th class="col-num col-profit">毛利率</th>
            <th class="col-num col-customer">来客数</th>
            <th class="col-rate col-customer" v-if="showYoY">同比<br>来客数增长率</th>
            <th class="col-rate col-customer" v-if="showMoM">环比<br>来客数增长率</th>
            <th class="col-num col-price">客单价/元</th>
            <th class="col-rate col-price" v-if="showYoY">同比<br>客单价增长率</th>
            <th class="col-rate col-price" v-if="showMoM">环比<br>客单价增长率</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, idx) in tableData" :key="idx">
            <!-- 小计行 -->
            <tr v-if="row.isSubtotal" class="subtotal">
              <td colspan="4" class="col-merge subtotal-label">{{ row.deptName }}</td>
              <td class="col-num col-sales">{{ formatAmount(row.salesAmount) }}</td>
              <td :class="['col-rate', 'col-sales', getRateClass(row.salesYoY)]" v-if="showYoY">{{ formatRate(row.salesYoY) }}</td>
              <td :class="['col-rate', 'col-sales', getRateClass(row.salesMoM)]" v-if="showMoM">{{ formatRate(row.salesMoM) }}</td>
              <td class="col-num col-profit">{{ formatAmount(row.profitAmount) }}</td>
              <td :class="['col-rate', 'col-profit', getRateClass(row.profitYoY)]" v-if="showYoY">{{ formatRate(row.profitYoY) }}</td>
              <td :class="['col-rate', 'col-profit', getRateClass(row.profitMoM)]" v-if="showMoM">{{ formatRate(row.profitMoM) }}</td>
              <td class="col-num col-profit">{{ row.profitRate }}%</td>
              <td class="col-num col-customer">{{ formatAmount(row.customers) }}</td>
              <td :class="['col-rate', 'col-customer', getRateClass(row.customerYoY)]" v-if="showYoY">{{ formatRate(row.customerYoY) }}</td>
              <td :class="['col-rate', 'col-customer', getRateClass(row.customerMoM)]" v-if="showMoM">{{ formatRate(row.customerMoM) }}</td>
              <td class="col-num col-price">{{ formatAmount(row.avgPrice) }}</td>
              <td :class="['col-rate', 'col-price', getRateClass(row.avgPriceYoY)]" v-if="showYoY">{{ formatRate(row.avgPriceYoY) }}</td>
              <td :class="['col-rate', 'col-price', getRateClass(row.avgPriceMoM)]" v-if="showMoM">{{ formatRate(row.avgPriceMoM) }}</td>
            </tr>
            <!-- 总计行 -->
            <tr v-else-if="row.isTotal" class="total">
              <td colspan="4" class="col-merge total-label">{{ row.deptName }}</td>
              <td class="col-num col-sales">{{ formatAmount(row.salesAmount) }}</td>
              <td :class="['col-rate', 'col-sales', getRateClass(row.salesYoY)]" v-if="showYoY">{{ formatRate(row.salesYoY) }}</td>
              <td :class="['col-rate', 'col-sales', getRateClass(row.salesMoM)]" v-if="showMoM">{{ formatRate(row.salesMoM) }}</td>
              <td class="col-num col-profit">{{ formatAmount(row.profitAmount) }}</td>
              <td :class="['col-rate', 'col-profit', getRateClass(row.profitYoY)]" v-if="showYoY">{{ formatRate(row.profitYoY) }}</td>
              <td :class="['col-rate', 'col-profit', getRateClass(row.profitMoM)]" v-if="showMoM">{{ formatRate(row.profitMoM) }}</td>
              <td class="col-num col-profit">{{ row.profitRate }}%</td>
              <td class="col-num col-customer">{{ formatAmount(row.customers) }}</td>
              <td :class="['col-rate', 'col-customer', getRateClass(row.customerYoY)]" v-if="showYoY">{{ formatRate(row.customerYoY) }}</td>
              <td :class="['col-rate', 'col-customer', getRateClass(row.customerMoM)]" v-if="showMoM">{{ formatRate(row.customerMoM) }}</td>
              <td class="col-num col-price">{{ formatAmount(row.avgPrice) }}</td>
              <td :class="['col-rate', 'col-price', getRateClass(row.avgPriceYoY)]" v-if="showYoY">{{ formatRate(row.avgPriceYoY) }}</td>
              <td :class="['col-rate', 'col-price', getRateClass(row.avgPriceMoM)]" v-if="showMoM">{{ formatRate(row.avgPriceMoM) }}</td>
            </tr>
            <!-- 明细行 -->
            <tr v-else :class="{ 'odd': idx % 2 === 1 }">
              <td class="col-org">{{ row.orgName }}</td>
              <td class="col-group">{{ row.deptGroup }}</td>
              <td class="col-code">{{ row.deptCode }}</td>
              <td class="col-name">{{ row.deptName }}</td>
              <td class="col-num col-sales">{{ formatAmount(row.salesAmount) }}</td>
              <td :class="['col-rate', 'col-sales', getRateClass(row.salesYoY)]" v-if="showYoY">{{ formatRate(row.salesYoY) }}</td>
              <td :class="['col-rate', 'col-sales', getRateClass(row.salesMoM)]" v-if="showMoM">{{ formatRate(row.salesMoM) }}</td>
              <td class="col-num col-profit">{{ formatAmount(row.profitAmount) }}</td>
              <td :class="['col-rate', 'col-profit', getRateClass(row.profitYoY)]" v-if="showYoY">{{ formatRate(row.profitYoY) }}</td>
              <td :class="['col-rate', 'col-profit', getRateClass(row.profitMoM)]" v-if="showMoM">{{ formatRate(row.profitMoM) }}</td>
              <td class="col-num col-profit">{{ row.profitRate }}%</td>
              <td class="col-num col-customer">{{ formatAmount(row.customers) }}</td>
              <td :class="['col-rate', 'col-customer', getRateClass(row.customerYoY)]" v-if="showYoY">{{ formatRate(row.customerYoY) }}</td>
              <td :class="['col-rate', 'col-customer', getRateClass(row.customerMoM)]" v-if="showMoM">{{ formatRate(row.customerMoM) }}</td>
              <td class="col-num col-price">{{ formatAmount(row.avgPrice) }}</td>
              <td :class="['col-rate', 'col-price', getRateClass(row.avgPriceYoY)]" v-if="showYoY">{{ formatRate(row.avgPriceYoY) }}</td>
              <td :class="['col-rate', 'col-price', getRateClass(row.avgPriceMoM)]" v-if="showMoM">{{ formatRate(row.avgPriceMoM) }}</td>
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
.tag.loaded {
  background: #e8f5e9;
  color: #2e7d32;
}
.toggle-row {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 8px;
}
.toggle-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  user-select: none;
}
.toggle-item input {
  cursor: pointer;
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
.query-item select {
  min-width: 120px;
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
  border: 1px solid #d0d0d0;
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
  border: 1px solid #e8e8e8;
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
.col-org { min-width: 130px; }
.col-group { min-width: 80px; }
.col-code { min-width: 70px; }
.col-name { min-width: 100px; text-align: left !important; padding-left: 10px !important; }
.col-merge { text-align: center !important; font-weight: 700; font-size: 14px; letter-spacing: 2px; }
.col-num { min-width: 85px; text-align: center !important; font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif; }
.col-rate { min-width: 70px; }

/* 列分组颜色 */
.col-sales { background: #fff3e0 !important; }
.col-profit { background: #e8f5e9 !important; }
.col-customer { background: #e3f2fd !important; }
.col-price { background: #fce4ec !important; }

/* 小计行 */
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

/* 总计行 */
.total {
  background: linear-gradient(90deg, #ffd54f 0%, #ffca28 100%) !important;
  color: #4e342e !important;
  font-weight: 800;
}
.total td {
  border-top: 2px solid #e65100 !important;
  border-bottom: 3px double #bf360c !important;
  color: #3e2723 !important;
}
.total:hover {
  background: linear-gradient(90deg, #ffc107 0%, #ffb300 100%) !important;
}

/* 增长率颜色（中国股市惯例：涨红跌绿） */
.rate-up {
  color: #d32f2f;
  font-weight: 500;
}
.rate-down {
  color: #388e3c;
  font-weight: 500;
}
</style>

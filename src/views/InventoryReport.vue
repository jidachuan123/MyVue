<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '../utils/request'

const loading = ref(false)
const dataList = ref([])
const totalInfo = ref('')

const queryForm = reactive({
  orgCode: '1104001',
  warehouse: '',
  department: '',
  docNo: 'PD12509300010',
  docStatus: '',
  tenantId: '8',
  lang: 'L',
  location: '',
  checkResult: '',
  startDate: '2025-09-01',
  endDate: '2025-09-30'
})

const docStatusOptions = [
  { label: '全部', value: '' },
  { label: '尚未审核', value: '尚未审核' },
  { label: '已审核', value: '已审核' },
  { label: '已完成', value: '已完成' }
]

const checkResultOptions = [
  { label: '全部', value: '' },
  { label: '盘盈', value: '盘盈' },
  { label: '盘亏', value: '盘亏' },
  { label: '盘平', value: '盘平' },
  { label: '漏盘', value: '漏盘' }
]

async function fetchReport() {
  loading.value = true
  try {
    const params = {}
    if (queryForm.orgCode) params.orgCode = queryForm.orgCode
    if (queryForm.warehouse) params.warehouse = queryForm.warehouse
    if (queryForm.department) params.department = queryForm.department
    if (queryForm.docNo) params.docNo = queryForm.docNo
    if (queryForm.docStatus) params.docStatus = queryForm.docStatus
    if (queryForm.tenantId) params.tenantId = queryForm.tenantId
    if (queryForm.lang) params.lang = queryForm.lang
    if (queryForm.location) params.location = queryForm.location
    if (queryForm.checkResult) params.checkResult = queryForm.checkResult
    if (queryForm.startDate) params.startDate = queryForm.startDate
    if (queryForm.endDate) params.endDate = queryForm.endDate

    dataList.value = await request.get('/consumer/report/inventory', params)

    const status = queryForm.docStatus ? `单据状态: ${queryForm.docStatus}` : '单据状态: 全部'
    totalInfo.value = `[${status}][开始时间: ${queryForm.startDate}][结束时间: ${queryForm.endDate}]`
  } catch (e) {
    alert('查询失败: ' + e.message)
  } finally {
    loading.value = false
  }
}

function formatDate(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  if (isNaN(d)) return dt
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

function formatNumber(n) {
  if (n === null || n === undefined) return ''
  const num = Number(n)
  if (isNaN(num)) return n
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

onMounted(() => {
  fetchReport()
})
</script>

<template>
  <div class="report-page">
    <div class="query-panel">
      <div class="query-row">
        <div class="query-item">
          <label>盘点单据号:</label>
          <input v-model="queryForm.docNo" type="text" placeholder="请输入盘点单据号" />
        </div>
        <div class="query-item">
          <label>单据状态:</label>
          <select v-model="queryForm.docStatus">
            <option v-for="opt in docStatusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="query-item">
          <label>位置:</label>
          <input v-model="queryForm.location" type="text" placeholder="请输入位置" />
        </div>
      </div>
      <div class="query-row">
        <div class="query-item">
          <label>开始时间:</label>
          <input v-model="queryForm.startDate" type="date" />
        </div>
        <div class="query-item">
          <label>结束时间:</label>
          <input v-model="queryForm.endDate" type="date" />
        </div>
        <div class="query-item">
          <label>机构:</label>
          <input v-model="queryForm.orgCode" type="text" placeholder="请输入机构编码" />
        </div>
      </div>
      <div class="query-row">
        <div class="query-item">
          <label>仓库:</label>
          <input v-model="queryForm.warehouse" type="text" placeholder="请输入仓库" />
        </div>
        <div class="query-item">
          <label>部门:</label>
          <input v-model="queryForm.department" type="text" placeholder="请输入部门" />
        </div>
        <div class="query-item">
          <label>盘点结果:</label>
          <select v-model="queryForm.checkResult">
            <option v-for="opt in checkResultOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
      </div>
      <div class="query-actions">
        <button class="btn-primary" @click="fetchReport" :disabled="loading">
          {{ loading ? '查询中...' : '查询' }}
        </button>
        <button class="btn-default" @click="$router.push('/')">返回用户列表</button>
      </div>
    </div>

    <div class="filter-info" v-if="totalInfo">{{ totalInfo }}</div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:40px">行号</th>
            <th>盘点日期</th>
            <th>盘点单据号</th>
            <th>审核日期</th>
            <th>机构编码</th>
            <th>机构名称</th>
            <th>仓库</th>
            <th>数量差</th>
            <th>部门编码</th>
            <th>部门名称</th>
            <th class="num">库存数量</th>
            <th class="num">实盘数量</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in dataList" :key="idx" :class="idx % 2 === 1 ? 'odd' : ''">
            <td>{{ idx + 1 }}</td>
            <td>{{ formatDate(item['盘点日期']) }}</td>
            <td>{{ item['盘点单据号'] }}</td>
            <td>{{ formatDate(item['审核日期']) }}</td>
            <td>{{ item['机构编码'] }}</td>
            <td>{{ item['机构名称'] }}</td>
            <td>{{ item['仓库'] }}</td>
            <td :class="item['数量差'] > 0 ? 'positive' : item['数量差'] < 0 ? 'negative' : ''">
              {{ formatNumber(item['数量差']) }}
            </td>
            <td>{{ item['部门编码'] }}</td>
            <td>{{ item['部门名称'] }}</td>
            <td class="num">{{ formatNumber(item['库存数量']) }}</td>
            <td class="num">{{ formatNumber(item['实盘数量']) }}</td>
          </tr>
          <tr v-if="dataList.length === 0">
            <td colspan="12" class="empty">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.report-page {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  font-size: 13px;
  color: #333;
}
.query-panel {
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}
.query-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  align-items: center;
}
.query-row:last-child {
  margin-bottom: 0;
}
.query-item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}
.query-item label {
  white-space: nowrap;
  color: #555;
  font-size: 13px;
  width: 72px;
  text-align: right;
  flex-shrink: 0;
}
.query-item input,
.query-item select {
  flex: 1;
  padding: 5px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  transition: border-color .2s;
  min-width: 0;
}
.query-item input:focus,
.query-item select:focus {
  border-color: #1890ff;
}
.query-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  padding-left: 78px;
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
.btn-primary:hover {
  background: #40a9ff;
}
.btn-primary:disabled {
  background: #bae7ff;
  cursor: not-allowed;
}
.btn-default {
  background: #fff;
  color: #555;
  border: 1px solid #d9d9d9;
  padding: 6px 18px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all .2s;
}
.btn-default:hover {
  border-color: #1890ff;
  color: #1890ff;
}
.filter-info {
  padding: 8px 20px;
  font-size: 12px;
  color: #888;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
}
.table-wrapper {
  overflow-x: auto;
  padding: 0 0 16px;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.data-table thead th {
  background: #f5f5f5;
  color: #333;
  font-weight: 600;
  padding: 10px 8px;
  border-bottom: 2px solid #e8e8e8;
  text-align: center;
  white-space: nowrap;
}
.data-table tbody td {
  padding: 10px 8px;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
}
.data-table tbody tr:hover {
  background: #e6f7ff;
}
.data-table tbody tr.odd {
  background: #fafafa;
}
.data-table tbody tr.odd:hover {
  background: #e6f7ff;
}
.data-table .num {
  text-align: right;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}
.data-table .empty {
  text-align: center;
  color: #999;
  padding: 30px;
}
.positive {
  color: #52c41a;
}
.negative {
  color: #f5222d;
}
</style>

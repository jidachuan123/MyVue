<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '../utils/request'

const goodsList = ref([])
const loading = ref(false)
const error = ref('')
const apiResult = ref(null)

const query = reactive({
  goodsCode: '',
  goodsName: '',
  pageNum: 1,
  pageSize: 20
})

async function fetchExternalGoods() {
  loading.value = true
  error.value = ''
  apiResult.value = null
  try {
    const params = { pageNum: query.pageNum, pageSize: query.pageSize }
    if (query.goodsCode) params.goodsCode = query.goodsCode
    if (query.goodsName) params.goodsName = query.goodsName

    const data = await request.get('/consumer/external/demo/goods/query', params)
    console.log('External Demo response:', data)
    apiResult.value = data
    goodsList.value = data.result || []
  } catch (e) {
    error.value = e.message || '调用失败'
    console.error(e)
  } finally {
    loading.value = false
  }
}

function reset() {
  query.goodsCode = ''
  query.goodsName = ''
  query.pageNum = 1
  fetchExternalGoods()
}

onMounted(() => {
  // 自动加载一次，展示 Mock 数据
  fetchExternalGoods()
})
</script>

<template>
  <div class="panel">
    <div class="panel-header">
      <h2>外部系统对接 - Demo</h2>
      <span class="badge" v-if="!loading && !error">
        Provider → ExternalApiHelper → Mock
      </span>
    </div>

    <!-- 查询栏 -->
    <div class="search-bar">
      <div class="field">
        <label>商品编码</label>
        <input v-model="query.goodsCode" placeholder="如 TEST001" @keyup.enter="fetchExternalGoods" />
      </div>
      <div class="field">
        <label>商品名称</label>
        <input v-model="query.goodsName" placeholder="可选" @keyup.enter="fetchExternalGoods" />
      </div>
      <button class="btn-query" @click="fetchExternalGoods">查询</button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>

    <!-- Loading -->
    <div class="state-box" v-if="loading">
      <div class="spinner"></div>
      <p>正在调用 External API...</p>
    </div>

    <!-- Error -->
    <div class="state-box error" v-else-if="error">
      <div class="error-icon">!</div>
      <p>{{ error }}</p>
      <button class="btn-retry" @click="fetchExternalGoods">重试</button>
    </div>

    <!-- 结果 -->
    <template v-else>
      <!-- ApiResult 原始信息卡片 -->
      <div class="meta-card" v-if="apiResult">
        <div class="meta-row">
          <span class="meta-label">ApiResult</span>
          <span class="meta-item">code: <b>{{ apiResult.code }}</b></span>
          <span class="meta-item">msg: <b>{{ apiResult.msg }}</b></span>
          <span class="meta-item" v-if="apiResult.total !== undefined">total: <b>{{ apiResult.total }}</b></span>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>商品编码</th>
              <th>商品名称</th>
              <th>规格型号</th>
              <th>单位</th>
              <th class="num">单价</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in goodsList" :key="item.goodsCode || idx"
              :class="idx % 2 === 1 ? 'odd' : ''">
              <td>{{ idx + 1 }}</td>
              <td><span class="code">{{ item.goodsCode }}</span></td>
              <td class="name-cell">{{ item.goodsName }}</td>
              <td>{{ item.goodsModel }}</td>
              <td>{{ item.unit }}</td>
              <td class="num">{{ item.price ? '¥' + Number(item.price).toFixed(2) : '-' }}</td>
            </tr>
            <tr v-if="goodsList.length === 0">
              <td colspan="6" class="empty">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- 调用链路说明 -->
    <div class="flow-card">
      <div class="flow-title">调用链路</div>
      <div class="flow-steps">
        <span class="step">Vue 前端</span>
        <span class="arrow">→</span>
        <span class="step">Consumer (8002)<br/><small>FeignClient</small></span>
        <span class="arrow">→</span>
        <span class="step">Provider (8001)<br/><small>ExternalController</small></span>
        <span class="arrow">→</span>
        <span class="step">DemoExternalService<br/><small>Mock 数据</small></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  background: linear-gradient(135deg, #38a169, #2f855a);
  color: #fff;
}
.panel-header h2 { font-size: 1.25rem; font-weight: 600; }
.badge {
  background: rgba(255,255,255,0.2);
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
}

/* 查询栏 */
.search-bar {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
}
.field { display: flex; flex-direction: column; gap: 4px; }
.field label { font-size: 12px; color: #888; }
.field input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  width: 180px;
  box-sizing: border-box;
}
.field input:focus { border-color: #38a169; }
.btn-query {
  background: #38a169;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
}
.btn-query:hover { background: #2f855a; }
.btn-reset {
  background: #fff;
  color: #666;
  border: 1px solid #d9d9d9;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.btn-reset:hover { border-color: #38a169; color: #38a169; }

/* meta 卡片 */
.meta-card {
  margin: 16px 24px;
  padding: 10px 16px;
  background: #f0fff4;
  border: 1px solid #c6f6d5;
  border-radius: 8px;
}
.meta-row { display: flex; gap: 24px; flex-wrap: wrap; font-size: 13px; }
.meta-label { color: #38a169; font-weight: 600; }
.meta-item { color: #555; }

/* 状态 */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 20px;
  color: #666;
}
.state-box.error { color: #c0392b; }
.error-icon {
  width: 56px; height: 56px;
  background: #c0392b; color: #fff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; font-weight: 700;
}
.spinner {
  width: 40px; height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #38a169;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.btn-retry {
  background: #38a169;
  color: #fff;
  border: none;
  padding: 10px 28px;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
}

/* 表格 */
.table-wrap { overflow-x: auto; padding: 16px 24px; }
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
thead th {
  background: #f5f5f5;
  color: #333;
  font-weight: 600;
  padding: 10px 12px;
  border-bottom: 2px solid #e0e0e0;
  text-align: center;
  white-space: nowrap;
}
tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
}
tbody tr.odd { background: #fafafa; }
tbody tr:hover { background: #f0fff4; }
.num { text-align: right; font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif; }
.name-cell { text-align: left; }
.code { font-family: monospace; color: #38a169; font-size: 12px; }
.empty { color: #999; padding: 30px !important; }

/* 调用链路 */
.flow-card {
  margin: 0 24px 20px;
  padding: 16px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}
.flow-title { font-size: 13px; font-weight: 600; color: #4a5568; margin-bottom: 10px; }
.flow-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
}
.step {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 12px;
  color: #2d3748;
  text-align: center;
  line-height: 1.5;
}
.step small { color: #a0aec0; }
.arrow { color: #a0aec0; font-size: 18px; font-weight: 700; }
</style>

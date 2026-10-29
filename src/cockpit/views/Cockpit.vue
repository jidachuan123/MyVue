<template>
  <div class="screen-wrap">
    <!-- 固定 1920×1080 画布，按窗口等比缩放 -->
    <div class="cockpit" :style="{ transform: `scale(${scale})` }">
      <!-- ======================= 顶部 ======================= -->
      <header class="hd">
        <div class="hd-left">
          <span class="hd-date num">{{ dateText }}</span>
          <span class="hd-week">{{ weekText }}</span>
        </div>

        <div class="hd-center">
          <h1 class="hd-title">佳和集团经营数据驾驶舱</h1>
          <div class="hd-subtitle">JIAHE GROUP · OPERATION COCKPIT</div>
        </div>

        <div class="hd-right">
          <span v-if="ov.demo" class="hd-badge">示例数据</span>
          <span class="hd-update">更新 <b>{{ clock }}</b></span>
          <button class="hd-btn" @click="toggleFullscreen">
            {{ isFullscreen ? '退出全屏' : '全屏' }}
          </button>
        </div>
      </header>

      <!-- ======================= 主体 ======================= -->
      <main class="main">
        <!-- ① 销售趋势（近 7 天） -->
        <PanelBox class="a-trend" title="销售趋势" sub="近 7 天 · 万元">
          <template #extra>
            7 天合计 <b class="num" style="color: #9fd8ff">{{ fmtAmount(trendTotal) }}</b>
          </template>
          <TrendChart :data="ov.trend7d" />
        </PanelBox>

        <!-- ② 集团销售：昨日 / 本月累计 / 本年累计 -->
        <PanelBox class="a-group" title="集团销售" sub="单位：万元">
          <div class="group-wrap">
            <div class="group-top">
              <div class="kpi-label">昨日集团销售（万元）</div>
              <div class="kpi-value">{{ fmtAmount(ov.groupYesterday.amount) }}</div>
              <div class="kpi-chips">
                <span class="chip">
                  日环比
                  <b :class="rateClass(ov.groupYesterday.dod)">{{ fmtPct(ov.groupYesterday.dod) }}</b>
                </span>
                <span class="chip">
                  年同比
                  <b :class="rateClass(ov.groupYesterday.yoy)">{{ fmtPct(ov.groupYesterday.yoy) }}</b>
                </span>
              </div>
            </div>

            <div class="group-bottom">
              <div class="mini-kpi">
                <div class="mini-kpi-label">本月累计（万元）</div>
                <div class="mini-kpi-value">{{ fmtAmount(ov.monthToDate.amount, 0) }}</div>
                <div class="mini-kpi-chips">
                  <span class="chip">
                    月环比 <b :class="rateClass(ov.monthToDate.mom)">{{ fmtPct(ov.monthToDate.mom) }}</b>
                  </span>
                  <span class="chip">
                    月同比 <b :class="rateClass(ov.monthToDate.yoy)">{{ fmtPct(ov.monthToDate.yoy) }}</b>
                  </span>
                </div>
              </div>

              <div class="mini-kpi">
                <div class="mini-kpi-label">本年累计（万元）</div>
                <div class="mini-kpi-value">{{ fmtAmount(ov.yearToDate.amount, 0) }}</div>
                <div class="mini-kpi-chips">
                  <span class="chip">
                    年同比 <b :class="rateClass(ov.yearToDate.yoy)">{{ fmtPct(ov.yearToDate.yoy) }}</b>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </PanelBox>

        <!-- ③ 今日实时销售 + 各业态柱状图 -->
        <PanelBox class="a-realtime" title="今日实时销售" sub="T+0 口径">
          <template #extra>
            <span class="live"><i class="dot"></i>实时</span>
          </template>

          <div class="realtime-top">
            <div>
              <div class="kpi-label">截至 {{ ov.todayRealtime.asOfTime }} 累计</div>
              <div class="rt-value">
                {{ fmtAmount(ov.todayRealtime.amount) }}<span class="rt-unit">万元</span>
              </div>
            </div>
            <div class="rt-side">
              较昨日同时段
              <b :class="rateClass(ov.todayRealtime.vsYesterday)">
                {{ fmtPct(ov.todayRealtime.vsYesterday) }}
              </b>
              <br />
              数据时间 {{ ov.asOf }}
            </div>
          </div>

          <div class="sub-title">各业态销售（万元）</div>
          <BizBarChart :data="ov.bizTypes" />
        </PanelBox>

        <!-- ④ 各业态昨日经营（11 张卡片） -->
        <PanelBox class="a-cards" title="各业态昨日经营" sub="单位：万元 · 上排购物中心 / 下排业态汇总">
          <div class="cards-wrap">
            <div class="card-row card-row--5">
              <BizCard v-for="c in mallCards" :key="'m-' + c.name" :card="c" />
            </div>
            <div class="card-row card-row--6">
              <BizCard v-for="c in otherCards" :key="'o-' + c.type + '-' + c.name" :card="c" />
            </div>
          </div>
        </PanelBox>

        <!-- ⑤ 各门店销售总览 -->
        <PanelBox class="a-stores" title="各门店销售总览" sub="单位：万元" tight>
          <template #extra>{{ ov.stores.length }} 家门店</template>
          <StoreTable :rows="ov.stores" />
        </PanelBox>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import PanelBox from '../components/PanelBox.vue'
import TrendChart from '../components/TrendChart.vue'
import BizBarChart from '../components/BizBarChart.vue'
import StoreTable from '../components/StoreTable.vue'
import BizCard from '../components/BizCard.vue'
import { useScreenScale } from '../composables/useScreenScale'
import { fetchOverview, demoOverview } from '../api/cockpit'
import { fmtAmount, fmtPct, rateClass } from '../utils/format'

const { scale } = useScreenScale(1920, 1080)

/** 整屏数据（结构见 src/mock/demo.js 与后端 CockpitOverviewVO） */
const ov = ref(demoOverview)

/* ---------------- 顶部时钟 ---------------- */
const now = ref(new Date())
const clock = computed(() => {
  const d = now.value
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
})
const dateText = computed(() => {
  const d = now.value
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
})
const weekText = computed(() => '星期' + '日一二三四五六'[now.value.getDay()])

/* ---------------- 数据加载 ---------------- */
const loading = ref(false)
let refreshTimer = null
let clockTimer = null

async function load() {
  loading.value = true
  try {
    const res = await fetchOverview()
    if (res) ov.value = res
  } catch (e) {
    // 后端没起来时退回示例数据，保证大屏不白屏；角标会提示「示例数据」
    ov.value = demoOverview
    console.warn('[驾驶舱] 接口未连通，使用示例数据：', e.message)
  } finally {
    loading.value = false
  }
}

/* ---------------- 派生数据 ---------------- */
const trendTotal = computed(() =>
  (ov.value.trend7d || []).reduce((s, r) => s + Number(r.amount || 0), 0)
)
const mallCards = computed(() => (ov.value.bizCards || []).filter((c) => c.type === '购物中心'))
const otherCards = computed(() => (ov.value.bizCards || []).filter((c) => c.type !== '购物中心'))

/* ---------------- 全屏 ---------------- */
const isFullscreen = ref(false)

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {})
  } else {
    document.exitFullscreen?.()
  }
}

function onFsChange() {
  isFullscreen.value = !!document.fullscreenElement
}

/* ---------------- 生命周期 ---------------- */
onMounted(() => {
  load()
  clockTimer = setInterval(() => (now.value = new Date()), 1000)
  // 大屏常驻：每分钟刷新一次（后续接实时数据可改 30s / 10s）
  refreshTimer = setInterval(load, 60 * 1000)
  document.addEventListener('fullscreenchange', onFsChange)
})

onBeforeUnmount(() => {
  clearInterval(clockTimer)
  clearInterval(refreshTimer)
  document.removeEventListener('fullscreenchange', onFsChange)
})
</script>

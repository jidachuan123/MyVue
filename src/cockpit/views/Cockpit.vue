<template>
  <div class="screen-wrap">
    <!--
      固定 1920 宽画布，按「宽度」等比缩放铺满整个视口；
      高度由 canvasH 反算（视口高 / 缩放比），多出来的高度由中间那一行 1fr 吸收，
      因此不会像 contain 缩放那样在左右留黑边。
    -->
    <div class="cockpit" :style="{ height: `${canvasH}px`, transform: `scale(${scale})` }">
      <!-- ======================= 顶部标题 ======================= -->
      <header class="hd">
        <div class="hd-left">
          <div class="hd-brand">
            <span class="hd-logo">佳</span>
            <div class="hd-brand-text">
              <div class="hd-title">{{ scopeMeta.title }}</div>
              <div class="hd-subtitle">{{ scopeMeta.subtitle }}</div>
            </div>
          </div>
        </div>

        <div class="hd-right">
          <span class="hd-live"><i class="dot"></i>数据实时同步</span>
          <span class="hd-meta">数据日期：<b class="num">{{ dataDate }}</b></span>
          <span class="hd-meta">更新时间：<b class="num">{{ clock }}</b></span>
        </div>
      </header>

      <!-- ======================= 主体 ======================= -->
      <main class="main">
        <!-- ① 顶部 4 张 KPI -->
        <div class="row-kpi">
          <KpiCard v-for="k in ov.kpis" :key="k.key" :kpi="k" />
        </div>

        <!-- ② 中部：8 张业态卡 + 右侧排名 -->
        <div class="row-biz">
          <div class="biz-grid">
            <BizCard v-for="c in ov.bizCards" :key="c.key" :card="c" />
          </div>

          <PanelBox class="biz-rank" title="各业态销售" sub="昨日 · 万元" tight>
            <template #extra>
              <span class="rank-total">
                合计 <b class="num">{{ fmtAmount(rankTotal, 1) }}</b>
              </span>
            </template>
            <RankList :items="ov.ranking" />
          </PanelBox>
        </div>

        <!-- ③ 底部：近 7 日销售趋势 -->
        <PanelBox class="row-trend" title="销售趋势（近 7 日）" sub="集团合计 · 单位：万元">
          <template #extra>
            <span class="trend-extra">
              7 日合计 <b class="num">{{ fmtAmount(trendTotal, 1) }}</b>
            </span>
          </template>
          <TrendChart :data="ov.trend7d" />
        </PanelBox>
      </main>

      <!-- ======================= 底部说明 ======================= -->
      <footer class="ft">
        <span>佳和集团 · 经营数据驾驶舱 v1.0</span>
        <span class="ft-sep">|</span>
        <span>口径：集团各业态 POS 销售数据（含税），不含退货冲红</span>
        <span class="ft-right" :class="{ 'ft-demo': ov.demo }">
          {{ ov.demo ? '示例数据 · 用于版式演示，正式上线后接入实时接口' : '数据来源：经营数据接口' }}
        </span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import KpiCard from '../components/KpiCard.vue'
import BizCard from '../components/BizCard.vue'
import RankList from '../components/RankList.vue'
import TrendChart from '../components/TrendChart.vue'
import PanelBox from '../components/PanelBox.vue'
import { useScreenScale } from '../composables/useScreenScale'
import { fetchOverview } from '../api/cockpit'
import { demoOverview } from '../mock/demo'
import { fmtAmount } from '../utils/format'

const { scale, canvasH } = useScreenScale(1920, 1080)

/* ---------------- 驾驶舱口径（集团 / 超市 / 百购） ---------------- */
const SCOPES = {
  group: { title: '佳和集团 · 经营数据驾驶舱', subtitle: 'JIAHE GROUP · OPERATING DASHBOARD' },
  supermarket: { title: '佳和集团 · 超市驾驶舱', subtitle: 'JIAHE SUPERMARKET · OPERATING DASHBOARD' },
  mall: { title: '佳和集团 · 百购驾驶舱', subtitle: 'JIAHE RETAIL MALL · OPERATING DASHBOARD' }
}
const scope = (() => {
  const s = new URLSearchParams(location.search).get('scope')
  return s && SCOPES[s] ? s : 'group'
})()
const scopeMeta = SCOPES[scope]

/** 整屏数据（结构见 src/cockpit/mock/demo.js） */
const ov = ref(demoOverview)

/* ---------------- 顶部时钟 ---------------- */
const now = ref(new Date())
const clock = computed(() => {
  const d = now.value
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}`
})
const dataDate = computed(() => {
  const d = now.value
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
})

/* ---------------- 派生数据 ---------------- */
const trendTotal = computed(() =>
  (ov.value.trend7d || []).reduce((s, r) => s + Number(r.amount || 0), 0)
)
const rankTotal = computed(() =>
  (ov.value.ranking || []).reduce((s, r) => s + Number(r.amount || 0), 0)
)

/* ---------------- 数据加载 ---------------- */

/**
 * 后端目前还是旧 VO 结构（todayRealtime/groupYesterday/bizTypes/stores），
 * 与本页要的 kpis/bizCards/ranking/trend7d 字段对不上。
 * 直接整份覆盖会渲染成空数值，所以这里做一次结构校验：
 * 四块形状都符合才认为后端已升级，否则整体退回示例数据。
 *
 * TODO 后端 VO 改成新结构后，这里的校验可以简化成 `if (res && res.kpis)`。
 */
function isNewShape(r) {
  if (!r || typeof r !== 'object') return false
  const kpis = r.kpis
  const cards = r.bizCards
  const rank = r.ranking
  const trend = r.trend7d
  return (
    Array.isArray(kpis) && kpis.length > 0 && kpis.every((k) => k && k.key && k.label && k.tone) &&
    Array.isArray(cards) && cards.length > 0 && cards.every((c) => c && c.tone && c.amount != null) &&
    Array.isArray(rank) && rank.length > 0 && rank.every((x) => x && x.color && x.amount != null) &&
    Array.isArray(trend) && trend.length > 0 && trend.every((p) => p && p.date && p.amount != null)
  )
}

let refreshTimer = null
let clockTimer = null

async function load() {
  try {
    const res = await fetchOverview({ scope })
    if (isNewShape(res)) {
      ov.value = { ...res, demo: false }
    } else {
      // 后端结构未升级：保持示例数据，不覆盖
      ov.value = demoOverview
      console.warn('[驾驶舱] 后端返回结构与页面不一致，继续使用示例数据')
    }
  } catch (e) {
    // 后端没起来时退回示例数据，保证大屏不白屏
    ov.value = demoOverview
    console.warn('[驾驶舱] 接口未连通，使用示例数据：', e.message)
  }
}

/* ---------------- 生命周期 ---------------- */
onMounted(() => {
  load()
  clockTimer = setInterval(() => (now.value = new Date()), 1000)
  // 大屏常驻：每分钟刷新一次（接实时数据后可调短）
  refreshTimer = setInterval(load, 60 * 1000)
})

onBeforeUnmount(() => {
  clearInterval(clockTimer)
  clearInterval(refreshTimer)
})
</script>

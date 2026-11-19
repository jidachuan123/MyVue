/**
 * 驾驶舱首页示例数据（2026-11-11 按参考图重做）
 *
 * ⚠️ 这里的数字全部是构造出来的示例值，只用于验证版式。
 *    后端接入真实数据后，本文件只在「接口不可用」时兜底，页面右上角会显示「示例数据」角标。
 *
 * 数据结构（与 views/Cockpit.vue 一一对应）：
 *   kpis      顶部 4 张 KPI 卡
 *   bizCards  中部 8 张业态卡（前 7 张为业态，第 8 张为集团客流）
 *   ranking   右侧「各业态销售」排行
 *   trend7d   底部近 7 日销售趋势
 */
export const demoOverview = {
  asOf: '2026-11-10 11:00',
  demo: true,

  /* ---------------- 顶部 4 张 KPI ---------------- */
  kpis: [
    {
      key: 'yesterday',
      label: '昨日集团销售（万元）',
      amount: 486.2,
      unit: '万元',
      tone: 'white',
      rates: [
        { label: '日环比', value: 0.038 },
        { label: '年同比', value: 0.064 }
      ],
      foot: [
        { label: '月累计', value: 2886.5, trend: 0.041 },
        { label: '年累计', value: 82480.7, trend: 0.058 }
      ]
    },
    {
      key: 'realtime',
      label: '今日实时销售',
      amount: 128.6,
      unit: '万元',
      tone: 'pink',
      side: { prefix: '截至 11:00 较昨日同时段', value: 0.042 },
      progress: { label: '进度达成', value: 0.264 }
    },
    {
      key: 'month',
      label: '本月累计销售',
      amount: 2836.5,
      unit: '万元',
      tone: 'cyan',
      rates: [
        { label: '月环比', value: 0.021 },
        { label: '年同比', value: 0.039 }
      ]
    },
    {
      key: 'year',
      label: '本年累计销售',
      amount: 32480.7,
      unit: '万元',
      tone: 'green',
      rates: [{ label: '年同比', value: 0.072 }],
      progress: { label: '年度目标达成', value: 0.866 }
    }
  ],

  /* ---------------- 中部 8 张业态卡 ---------------- */
  bizCards: [
    {
      key: 'sy', name: '佳和商管', tag: '商管运营', tone: 'orange',
      amount: 78.4, dod: 0.026, yoy: 0.048,
      share: 0.161, extraLabel: '出租率', extraValue: '96.4%',
      monthAcc: 452.8, yearAcc: 5186.4,
      spark: [62, 66, 64, 70, 69, 74, 72, 78]
    },
    {
      key: 'std', name: '佳和超市（标超）', tag: '大卖场', tone: 'cyan',
      amount: 152.6, dod: 0.052, yoy: 0.071,
      share: 0.314, extraLabel: '客单价', extraValue: '168.2 元',
      monthAcc: 892.6, yearAcc: 10248.5,
      spark: [118, 126, 121, 133, 140, 136, 145, 152]
    },
    {
      key: 'cvs', name: '佳和超市（便利店）', tag: '社区生活', tone: 'green',
      amount: 86.2, dod: 0.041, yoy: 0.060,
      share: 0.177, extraLabel: '客单价', extraValue: '42.6 元',
      monthAcc: 498.4, yearAcc: 5642.8,
      spark: [66, 70, 68, 74, 77, 75, 81, 86]
    },
    {
      key: 'food', name: '佳和餐饮', tag: '餐饮服务', tone: 'gold',
      amount: 42.8, dod: -0.012, yoy: 0.034,
      share: 0.088, extraLabel: '翻台率', extraValue: '3.2 次',
      monthAcc: 248.6, yearAcc: 2826.4,
      spark: [44, 46, 43, 45, 47, 44, 43, 42]
    },
    {
      key: 'hotel', name: '佳和酒店', tag: '房务经营', tone: 'pink',
      amount: 36.5, dod: 0.018, yoy: 0.052,
      share: 0.075, extraLabel: '出租率', extraValue: '81.8%',
      monthAcc: 212.5, yearAcc: 2418.6,
      spark: [31, 33, 32, 35, 34, 36, 35, 36]
    },
    {
      key: 'health', name: '佳和康养', tag: '康养增速', tone: 'purple',
      amount: 63.7, dod: -0.024, yoy: 0.021,
      share: 0.131, extraLabel: '入住率', extraValue: '82.6%',
      monthAcc: 365.2, yearAcc: 4186.2,
      spark: [58, 62, 60, 64, 66, 63, 65, 63]
    },
    {
      key: 'other', name: '其他自营业态', tag: '生活服务', tone: 'blue',
      amount: 26.0, dod: 0.009, yoy: 0.016,
      share: 0.054, extraLabel: '坪效', extraValue: '1,286 元',
      monthAcc: 166.4, yearAcc: 1971.8,
      spark: [22, 23, 22, 24, 25, 24, 25, 26]
    },
    {
      key: 'traffic', name: '集团客流（昨日）', tag: '客流量', tone: 'teal',
      isTraffic: true,
      amount: 42860, unit: '人次',
      extraLabel: '日均', extraValue: '6.18 万',
      yoy: 0.034,
      extra2Label: '人均消费', extra2Value: '113.4 元',
      spark: [39000, 40500, 39800, 41200, 42000, 41500, 42860]
    }
  ],

  /* ---------------- 右侧各业态排行 ---------------- */
  ranking: [
    { seq: 1, name: '标超', amount: 152.6, color: '#ff8a4c' },
    { seq: 2, name: '便利店', amount: 86.2, color: '#31e6a8' },
    { seq: 3, name: '佳和商管', amount: 78.4, color: '#3fe3ff' },
    { seq: 4, name: '佳和康养', amount: 63.7, color: '#31e6a8' },
    { seq: 5, name: '佳和餐饮', amount: 42.8, color: '#ffcf5c' },
    { seq: 6, name: '佳和酒店', amount: 36.5, color: '#ff6ea9' },
    { seq: 7, name: '其他自营业态', amount: 26.0, color: '#a06bff' }
  ],

  /* ---------------- 底部近 7 日趋势 ---------------- */
  trend7d: [
    { date: '11-04', amount: 428.6 },
    { date: '11-05', amount: 452.3 },
    { date: '11-06', amount: 468.9 },
    { date: '11-07', amount: 441.2 },
    { date: '11-08', amount: 475.6 },
    { date: '11-09', amount: 458.4 },
    { date: '11-10', amount: 485.2 }
  ]
}

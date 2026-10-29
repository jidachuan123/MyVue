/**
 * 前端兜底示例数据（仅当后端 /provider/cockpit/overview 取不到时使用）
 *
 * ⚠️ 这里的数字全部是构造出来的示例值（各层级之间已刻意对齐：
 *    门店明细 = 业态卡片 = 柱状图 = 集团合计 1862.34 万元），只用于验证版式。
 *    真实数据接上来之后，这个文件只在「后端没启动」时兜底，页面会打「示例数据」角标。
 */

export const demoOverview = {
  asOf: '2026-10-28 21:30',
  demo: true,

  // 今日实时（T+0）
  todayRealtime: {
    amount: 428.66,
    asOfTime: '13:57',
    vsYesterday: 0.0682
  },

  // 集团口径
  groupYesterday: { amount: 1862.34, dod: -0.0432, yoy: 0.0871 },
  monthToDate: { amount: 37072.3, mom: 0.0312, yoy: 0.0654 },
  yearToDate: { amount: 444923.0, yoy: 0.0412 },

  // 近 7 天趋势（lastYear = 去年同期，用于画对照虚线）
  trend7d: [
    { date: '10-22', amount: 1720.4, lastYear: 1630.2 },
    { date: '10-23', amount: 1798.2, lastYear: 1690.5 },
    { date: '10-24', amount: 2105.6, lastYear: 1980.3 },
    { date: '10-25', amount: 2380.9, lastYear: 2150.7 },
    { date: '10-26', amount: 1960.3, lastYear: 1880.4 },
    { date: '10-27', amount: 1946.2, lastYear: 1820.6 },
    { date: '10-28', amount: 1862.3, lastYear: 1712.8 }
  ],

  // 今日各业态（柱状图）
  bizTypes: [
    { name: '商管业态', amount: 1282.2 },
    { name: '超市业态', amount: 344.9 },
    { name: '便利店业态', amount: 73.6 },
    { name: '佳和餐饮', amount: 68.2 },
    { name: '佳和畅通', amount: 41.3 },
    { name: '佳和酒店', amount: 32.6 },
    { name: '其他自营业态', amount: 19.54 }
  ],

  // 各门店销售总览（滚动表格）
  stores: [
    { seq: 1, name: '海湾佳和诚购物中心', region: '菏泽市区', yesterday: 428.6, yoy: 0.1084, mom: 0.0318, grossRate: 0.2135, avgTicket: 86.5, customers: 4954 },
    { seq: 2, name: '海湾佳和里购物中心', region: '菏泽市区', yesterday: 336.2, yoy: 0.0716, mom: -0.0138, grossRate: 0.2051, avgTicket: 79.2, customers: 4245 },
    { seq: 3, name: '巨野中心店', region: '巨野', yesterday: 168.4, yoy: 0.0562, mom: 0.0214, grossRate: 0.1984, avgTicket: 62.4, customers: 2699 },
    { seq: 4, name: '巨野天悦城店', region: '巨野', yesterday: 196.7, yoy: 0.1338, mom: 0.0456, grossRate: 0.2213, avgTicket: 65.8, customers: 2989 },
    { seq: 5, name: '单县佳和汇', region: '单县', yesterday: 152.3, yoy: -0.0312, mom: -0.0524, grossRate: 0.1872, avgTicket: 58.9, customers: 2586 },
    { seq: 6, name: '佳和超市样板店', region: '菏泽市区', yesterday: 218.4, yoy: 0.0412, mom: 0.0128, grossRate: 0.1763, avgTicket: 42.6, customers: 5127 },
    { seq: 7, name: '佳和超市人民路店', region: '菏泽市区', yesterday: 62.1, yoy: 0.0226, mom: -0.0084, grossRate: 0.1685, avgTicket: 39.8, customers: 1560 },
    { seq: 8, name: '佳和超市牡丹路店', region: '菏泽市区', yesterday: 48.6, yoy: 0.0674, mom: 0.0212, grossRate: 0.1702, avgTicket: 41.2, customers: 1179 },
    { seq: 9, name: '佳和超市长江路店', region: '菏泽市区', yesterday: 15.8, yoy: -0.0842, mom: -0.0316, grossRate: 0.1621, avgTicket: 37.5, customers: 421 },
    { seq: 10, name: '佳和便利店001', region: '菏泽市区', yesterday: 43.2, yoy: 0.0956, mom: 0.0284, grossRate: 0.2245, avgTicket: 28.6, customers: 1510 },
    { seq: 11, name: '佳和便利店002', region: '菏泽市区', yesterday: 30.4, yoy: 0.0428, mom: -0.0112, grossRate: 0.2187, avgTicket: 26.4, customers: 1152 },
    { seq: 12, name: '佳和餐饮中心店', region: '菏泽市区', yesterday: 68.2, yoy: 0.1186, mom: 0.0532, grossRate: 0.5842, avgTicket: 126.8, customers: 538 },
    { seq: 13, name: '佳和畅通', region: '菏泽市区', yesterday: 41.3, yoy: 0.0324, mom: 0.0086, grossRate: 0.1425, avgTicket: 118.4, customers: 349 },
    { seq: 14, name: '佳和酒店', region: '菏泽市区', yesterday: 32.6, yoy: -0.0248, mom: -0.0142, grossRate: 0.6128, avgTicket: 428.5, customers: 76 },
    { seq: 15, name: '其他自营', region: '菏泽市区', yesterday: 19.54, yoy: 0.0156, mom: 0.0042, grossRate: 0.2341, avgTicket: 46.2, customers: 423 }
  ],

  // 底部业态卡片（11 张）
  bizCards: [
    { name: '海湾佳和诚', type: '购物中心', yesterday: 428.6, dod: 0.0318, yoy: 0.1084, monthAcc: 8520.6, yearAcc: 103240.5 },
    { name: '海湾佳和里', type: '购物中心', yesterday: 336.2, dod: -0.0138, yoy: 0.0716, monthAcc: 6680.2, yearAcc: 81240.8 },
    { name: '巨野中心店', type: '购物中心', yesterday: 168.4, dod: 0.0214, yoy: 0.0562, monthAcc: 3382.4, yearAcc: 40128.6 },
    { name: '巨野天悦店', type: '购物中心', yesterday: 196.7, dod: 0.0456, yoy: 0.1338, monthAcc: 3925.8, yearAcc: 46210.3 },
    { name: '单县佳和汇', type: '购物中心', yesterday: 152.3, dod: -0.0524, yoy: -0.0312, monthAcc: 3060.5, yearAcc: 37105.2 },
    { name: '佳和超市', type: '样板店', yesterday: 344.9, dod: 0.0128, yoy: 0.0412, monthAcc: 6820.4, yearAcc: 81050.6 },
    { name: '佳和超市', type: '便利店', yesterday: 73.6, dod: 0.0196, yoy: 0.0742, monthAcc: 1462.8, yearAcc: 17428.9 },
    { name: '佳和餐饮', type: '餐饮', yesterday: 68.2, dod: 0.0532, yoy: 0.1186, monthAcc: 1358.4, yearAcc: 16204.5 },
    { name: '佳和畅通', type: '物流', yesterday: 41.3, dod: 0.0086, yoy: 0.0324, monthAcc: 820.6, yearAcc: 9850.2 },
    { name: '佳和酒店', type: '酒店', yesterday: 32.6, dod: -0.0142, yoy: -0.0248, monthAcc: 652.4, yearAcc: 7812.6 },
    { name: '其他自营业态', type: '其他', yesterday: 19.54, dod: 0.0042, yoy: 0.0156, monthAcc: 388.2, yearAcc: 4650.8 }
  ]
}

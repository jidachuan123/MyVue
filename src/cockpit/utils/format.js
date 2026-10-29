/**
 * 数字 / 百分比格式化
 * 大屏对「千分位、正负号、箭头」比较敏感，统一在这里处理，页面里不要再各写一套。
 */

/** 金额：1,862.34 */
export function fmtAmount(v, digits = 2) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '-'
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
}

/** 整数：12,345 */
export function fmtInt(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '-'
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}

/** 比率：0.0871 → +8.71%（入参是小数，不是百分数） */
export function fmtPct(v, digits = 2) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '-'
  const sign = n > 0 ? '+' : ''
  return `${sign}${(n * 100).toFixed(digits)}%`
}

/** 带箭头的比率：+8.71% → ▲ 8.71%（涨=绿、跌=红，沿用项目既有口径） */
export function fmtPctArrow(v, digits = 2) {
  const n = Number(v)
  if (!Number.isFinite(n)) return { text: '-', cls: 'flat' }
  if (n > 0) return { text: `▲ ${(n * 100).toFixed(digits)}%`, cls: 'up' }
  if (n < 0) return { text: `▼ ${Math.abs(n * 100).toFixed(digits)}%`, cls: 'down' }
  return { text: `— 0.00%`, cls: 'flat' }
}

/** 涨跌配色 class */
export function rateClass(v) {
  const n = Number(v)
  if (!Number.isFinite(n) || n === 0) return 'flat'
  return n > 0 ? 'up' : 'down'
}

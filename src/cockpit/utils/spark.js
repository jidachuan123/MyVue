/**
 * 迷你趋势线（纯 SVG，不依赖 ECharts，卡片里用足够轻量）
 *
 * 用法：<SparkLine :data="[62,66,64,70]" tone="orange" />
 * 数据会按自身 min/max 归一化到视图高度，颜色跟随卡片主题色。
 */
const TONES = {
  orange: '#ff8a4c',
  cyan: '#3fe3ff',
  green: '#31e6a8',
  gold: '#ffcf5c',
  pink: '#ff6ea9',
  purple: '#a06bff',
  blue: '#2f7dff',
  teal: '#2ee6d6',
  white: '#9fd8ff'
}

export function sparkPath(data, width = 120, height = 34, padding = 3) {
  const nums = (Array.isArray(data) ? data : []).map(Number).filter(Number.isFinite)
  if (nums.length < 2) return { line: '', area: '', points: [] }

  const min = Math.min(...nums)
  const max = Math.max(...nums)
  // 全平的数据（max==min）会除零，兜底成中线
  const span = max - min || 1
  const xStep = (width - padding * 2) / (nums.length - 1)

  const points = nums.map((v, i) => {
    const x = padding + i * xStep
    const y = height - padding - ((v - min) / span) * (height - padding * 2)
    return [Number(x.toFixed(2)), Number(y.toFixed(2))]
  })

  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ')
  // 面积 = 折线 + 回到右下 + 回左下 闭合
  const area = `${line} L${points[points.length - 1][0]} ${height} L${points[0][0]} ${height} Z`

  return { line, area, points, color: null }
}

export function sparkTone(tone) {
  return TONES[tone] || TONES.cyan
}

export default { sparkPath, sparkTone }

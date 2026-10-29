import { demoOverview } from '../mock/demo'

/**
 * 驾驶舱数据接口
 *
 * 后端：provider-service → com.demo.provider.cockpit
 *   GET /provider/cockpit/overview   整屏一次取全（后续可按区块拆成多个接口）
 *
 * 取不到时返回本地示例数据（demo=true），保证大屏永远有画面可看 —— 大屏最忌讳白屏。
 */
export async function fetchOverview(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString()

  const res = await fetch(`/api/provider/cockpit/overview${qs ? '?' + qs : ''}`, {
    headers: { Accept: 'application/json' }
  })

  if (!res.ok) throw new Error(`接口返回 ${res.status}`)

  const json = await res.json()

  // 兼容两种返回：标准 ApiResult（code/result） 或裸对象
  if (json && typeof json.code !== 'undefined') {
    if (Number(json.code) !== 0) throw new Error(json.msg || '接口返回失败')
    return json.result
  }
  return json
}

export { demoOverview }

/**
 * 日期工具：入住/离店展示、间夜计算
 */

/** 格式化为 yyyy-MM-dd */
export function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 从 yyyy-MM-dd 字符串解析为 Date，无效则返回 null */
export function dateFromStr(s: string): Date | null {
  if (!s || !s.trim()) return null
  const [y, m, d] = s.trim().split('-').map(Number)
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null
  return new Date(y, m - 1, d)
}

/** 计算两日期间共几晚 */
export function nights(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime()
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)))
}

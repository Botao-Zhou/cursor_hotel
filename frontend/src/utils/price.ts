/**
 * 价格工具：最低价、展示格式化
 */

import type { Hotel } from '@/types/hotel'

/** 取酒店房型中的最低价（单位：元） */
export function getMinPrice(hotel: Hotel): number {
  const rooms = hotel.roomTypes ?? []
  if (rooms.length === 0) return 0
  return Math.min(...rooms.map((r) => Number(r.price) || 0))
}

/** 格式化为展示用字符串，如 ¥388 起 */
export function formatPriceFromHotel(hotel: Hotel): string {
  const min = getMinPrice(hotel)
  return min > 0 ? `¥${min}` : '-'
}

/** 分转元（若后端以分为单位时可使用） */
export function centsToYuan(cents: number): number {
  return Math.round(cents) / 100
}

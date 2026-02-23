/**
 * 酒店状态：PC 端与 H5 端共用的状态枚举与展示配置
 */

export const HOTEL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  OFFLINE: 'offline',
} as const

export type HotelStatusValue = (typeof HOTEL_STATUS)[keyof typeof HOTEL_STATUS]

export interface HotelStatusConfig {
  value: HotelStatusValue
  label: string
  tagColor: string
}

/** 下拉选项（如管理员筛选） */
export const HOTEL_STATUS_OPTIONS: HotelStatusConfig[] = [
  { value: HOTEL_STATUS.PENDING, label: '审核中', tagColor: 'orange' },
  { value: HOTEL_STATUS.APPROVED, label: '已通过', tagColor: 'green' },
  { value: HOTEL_STATUS.REJECTED, label: '未通过', tagColor: 'red' },
  { value: HOTEL_STATUS.OFFLINE, label: '已下线', tagColor: 'default' },
]

/** 商户端列表展示文案（已通过 → 已发布） */
const MERCHANT_LABEL_MAP: Record<HotelStatusValue, string> = {
  [HOTEL_STATUS.PENDING]: '审核中',
  [HOTEL_STATUS.APPROVED]: '已发布',
  [HOTEL_STATUS.REJECTED]: '未通过',
  [HOTEL_STATUS.OFFLINE]: '已下线',
}

/** 根据 status 获取展示配置（文案 + Tag 颜色），isMerchant 为 true 时“已通过”显示为“已发布” */
export function getHotelStatusConfig(
  status: string,
  isMerchant = false
): { text: string; color: string } {
  const option = HOTEL_STATUS_OPTIONS.find((o) => o.value === status)
  const label = option?.label ?? status || '-'
  const text = isMerchant && option && MERCHANT_LABEL_MAP[option.value] !== undefined
    ? MERCHANT_LABEL_MAP[option.value]
    : label
  return { text, color: option?.tagColor ?? 'default' }
}

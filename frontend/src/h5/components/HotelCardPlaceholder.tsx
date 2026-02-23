/**
 * 长列表渲染优化：占位块
 * 当卡片不在视口内时仅渲染此占位 div，保持滚动高度不变，避免大量 DOM 和重绘。
 */
export const HOTEL_CARD_PLACEHOLDER_HEIGHT = 180

export default function HotelCardPlaceholder() {
  return (
    <div
      className="h5-hotel-card-placeholder"
      style={{ height: HOTEL_CARD_PLACEHOLDER_HEIGHT }}
      aria-hidden
    />
  )
}

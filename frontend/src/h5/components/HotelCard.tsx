import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Image, Tag } from 'react-vant'
import type { Hotel } from '@/types/hotel'
import { getMinPrice } from '@/utils/price'
import { createPlaceholderImage } from '@/utils/placeholderImage'

const COVER_PLACEHOLDER = createPlaceholderImage(400, 200, 'Hotel')

/** 模拟评分（实际应由后端或点评数据提供），基于 id 保证同酒店稳定 */
function mockScore(id: string): number {
  let n = 0
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i)
  return Number((4 + (n % 80) / 100).toFixed(1))
}

/** 单条酒店卡片：封面图、名称、评分、地址、底价、快捷标签 */
export default function HotelCard({ hotel }: { hotel: Hotel }) {
  const navigate = useNavigate()
  const initialCover = useMemo(() => hotel.images?.[0] || COVER_PLACEHOLDER, [hotel.images])
  const [cover, setCover] = useState(initialCover)
  const price = getMinPrice(hotel)
  const score = mockScore(hotel.id)
  const tags = hotel.nearby ? hotel.nearby.split(/[,，、]/).slice(0, 3) : []

  return (
    <div
      className="h5-hotel-card"
      onClick={() => navigate(`/h5/detail/${hotel.id}`)}
      role="button"
      tabIndex={0}
    >
      <div className="h5-hotel-card-cover">
        <Image
          lazyload
          src={cover}
          alt=""
          fit="cover"
          width="100%"
          height={120}
          onError={() => setCover(COVER_PLACEHOLDER)}
        />
      </div>
      <div className="h5-hotel-card-body">
        <div className="h5-hotel-card-title">{hotel.nameZh}</div>
        <div className="h5-hotel-card-meta">
          <span className="h5-hotel-card-score">{score} 分</span>
          <span className="h5-hotel-card-star">{hotel.starLevel}星</span>
        </div>
        <div className="h5-hotel-card-addr">{hotel.address}</div>
        {tags.length > 0 && (
          <div className="h5-hotel-card-tags">
            {tags.map((t) => (
              <Tag key={t} plain type="primary" size="small" className="h5-hotel-card-tag">
                {t.trim()}
              </Tag>
            ))}
          </div>
        )}
        <div className="h5-hotel-card-price">
          <span className="h5-hotel-card-price-num">¥{price}</span>
          <span className="h5-hotel-card-price-unit">起</span>
        </div>
      </div>
    </div>
  )
}

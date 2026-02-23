import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  NavBar,
  Swipe,
  SwipeItem,
  Tag,
  Skeleton,
  Empty,
  ActionBar,
  ActionBarIcon,
  ActionBarButton,
  Calendar,
  Toast,
} from 'react-vant'
import { fetchHotelDetail, type Hotel } from '@/api/hotels'
import '@/styles/h5-detail.css'

const BANNER_PLACEHOLDERS = [
  'https://via.placeholder.com/800x400/1989fa/ffffff?text=Hotel+Photo+1',
  'https://via.placeholder.com/800x400/ff7d00/ffffff?text=Hotel+Photo+2',
  'https://via.placeholder.com/800x400/7232dd/ffffff?text=Hotel+Photo+3',
]

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function dateFromStr(s: string): Date | null {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function nights(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime()
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)))
}

export default function Detail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [calendarVisible, setCalendarVisible] = useState(false)
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(() => {
    const inStr = searchParams.get('checkIn') ?? ''
    const outStr = searchParams.get('checkOut') ?? ''
    const inDate = dateFromStr(inStr)
    const outDate = dateFromStr(outStr)
    if (inDate && outDate) return [inDate, outDate]
    return null
  })

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    fetchHotelDetail(id)
      .then((res) => {
        if (res.code !== 0 || !res.data) {
          setError(res.message || '酒店不存在或已下线')
          return
        }
        setHotel(res.data)
      })
      .catch(() => {
        setError('加载失败，请稍后重试')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  const images = useMemo(() => {
    if (hotel?.images && hotel.images.length > 0) return hotel.images
    return BANNER_PLACEHOLDERS
  }, [hotel])

  const tags = useMemo(() => {
    const t: string[] = []
    if (hotel?.nearby) {
      t.push(
        ...hotel.nearby
          .split(/[,，、]/)
          .map((v) => v.trim())
          .filter(Boolean),
      )
    }
    if (hotel?.openTime) {
      t.push(`开业时间 ${hotel.openTime}`)
    }
    return t.slice(0, 5)
  }, [hotel])

  const sortedRooms = useMemo(() => {
    if (!hotel?.roomTypes) return []
    return [...hotel.roomTypes].sort((a, b) => (a.price || 0) - (b.price || 0))
  }, [hotel])

  const dateText = useMemo(() => {
    if (!dateRange) return '请选择入住日期'
    const [start, end] = dateRange
    const n = nights(start, end)
    return `${formatDate(start)} - ${formatDate(end)} · 共${n}晚`
  }, [dateRange])

  const handleCalendarConfirm = (value: Date | Date[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setDateRange([value[0], value[1]])
    }
    setCalendarVisible(false)
  }

  const title = hotel?.nameZh || '酒店详情'

  return (
    <div className="h5-detail-page">
      <NavBar title={title} leftArrow onBack={() => navigate(-1)} />

      {loading ? (
        <div className="h5-detail-loading">
          <Skeleton title row={6} />
        </div>
      ) : error || !hotel ? (
        <div className="h5-detail-empty">
          <Empty description={error || '酒店不存在'} />
        </div>
      ) : (
        <>
          {/* 大图 Banner：轮播 */}
          <div className="h5-detail-banner">
            <Swipe autoplay={3000} indicatorColor="white">
              {images.map((src, idx) => (
                <SwipeItem key={idx}>
                  <img src={src} alt="hotel" className="h5-detail-banner-img" />
                </SwipeItem>
              ))}
            </Swipe>
          </div>

          {/* 基础信息卡片 */}
          <section className="h5-detail-section h5-detail-info">
            <h1 className="h5-detail-title">{hotel.nameZh}</h1>
            {hotel.nameEn && <div className="h5-detail-title-en">{hotel.nameEn}</div>}
            <div className="h5-detail-meta">
              <span className="h5-detail-star">{hotel.starLevel} 星酒店</span>
            </div>
            <div className="h5-detail-addr">{hotel.address}</div>
            {tags.length > 0 && (
              <div className="h5-detail-tags">
                {tags.map((t) => (
                  <Tag key={t} plain size="small" type="primary" className="h5-detail-tag">
                    {t}
                  </Tag>
                ))}
              </div>
            )}
          </section>

          {/* 日历+间夜 Banner */}
          <section
            className="h5-detail-section h5-detail-date"
            onClick={() => setCalendarVisible(true)}
          >
            <div className="h5-detail-date-title">入住/离店</div>
            <div className="h5-detail-date-text">{dateText}</div>
          </section>

          {/* 房型与价格列表：根据价格从低到高排序 */}
          <section className="h5-detail-section h5-detail-rooms">
            <h2 className="h5-detail-subtitle">房型与价格</h2>
            {sortedRooms.length === 0 ? (
              <div className="h5-detail-no-rooms">暂无房型信息</div>
            ) : (
              <ul className="h5-detail-room-list">
                {sortedRooms.map((room, idx) => {
                  const bedDesc = idx % 2 === 0 ? '大床 1.8m · 可住2人' : '双床 1.2m · 可住2人'
                  return (
                    <li key={room.id || room.name} className="h5-detail-room-item">
                      <div className="h5-detail-room-main">
                        <div className="h5-detail-room-name">{room.name}</div>
                        <div className="h5-detail-room-bed">{bedDesc}</div>
                      </div>
                      <div className="h5-detail-room-side">
                        <div className="h5-detail-room-price">
                          <span className="h5-detail-room-price-num">¥{room.price}</span>
                          <span className="h5-detail-room-price-unit">起</span>
                        </div>
                        <button
                          type="button"
                          className="h5-detail-room-book"
                          onClick={(e) => {
                            e.stopPropagation()
                            Toast.success('mock：预订流程待接入')
                          }}
                        >
                          预订
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* 日历弹层：复用首页 Calendar 逻辑 */}
          <Calendar
            visible={calendarVisible}
            poppable
            type="range"
            value={dateRange || undefined}
            showConfirm
            confirmText="确定"
            onConfirm={handleCalendarConfirm}
            onClose={() => setCalendarVisible(false)}
          />
        </>
      )}

      {/* 底部操作栏：客服/收藏 + 立即预订 */}
      <ActionBar safeAreaInsetBottom>
        <ActionBarIcon
          text="客服"
          icon="service-o"
          onClick={() => Toast.info('mock：联系客服')}
        />
        <ActionBarIcon
          text="收藏"
          icon="like-o"
          onClick={() => Toast.success('已收藏')}
        />
        <ActionBarButton
          type="danger"
          text="立即预订"
          onClick={() => Toast.success('mock：预订流程待接入')}
        />
      </ActionBar>
    </div>
  )
}

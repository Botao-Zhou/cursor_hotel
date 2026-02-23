import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Toast } from 'react-vant'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { fetchHotelList, type Hotel } from '@/api/hotels'
import HotelCardWithOptimization from '@/h5/components/HotelCardWithOptimization'
import '@/styles/h5-list.css'

/**
 * C 端酒店列表页：
 * - 接收首页 URL 参数（keyword/city/checkIn/checkOut 等），调用 fetchHotelList 分页拉取
 * - 顶部筛选头 + DropdownMenu 星级/价格；下拉刷新与上滑加载使用 Vant PullRefresh + List
 * - 长列表渲染优化：见 HotelCardWithOptimization，采用视口内才渲染完整卡片的策略，减少 DOM 与重绘
 */

const PAGE_SIZE = 10
const STAR_OPTIONS: Array<{ text: string; value: string }> = [
  { text: '不限', value: '' },
  { text: '五星', value: '5' },
  { text: '四星', value: '4' },
  { text: '三星', value: '3' },
  { text: '二星及以下', value: '1,2' },
]
const PRICE_OPTIONS: Array<{ text: string; value: string }> = [
  { text: '不限', value: '' },
  { text: '¥300以下', value: '0-300' },
  { text: '¥300-500', value: '300-500' },
  { text: '¥500-800', value: '500-800' },
  { text: '¥800以上', value: '800-' },
]

export default function H5List() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const keyword = searchParams.get('keyword') ?? ''
  const city = searchParams.get('city') ?? '杭州'
  const checkIn = searchParams.get('checkIn') ?? ''
  const checkOut = searchParams.get('checkOut') ?? ''
  const tags = searchParams.get('tags') ?? ''
  const starsParam = searchParams.get('stars') ?? ''
  const cityParam = searchParams.get('city') ?? ''

  const [list, setList] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [finished, setFinished] = useState(false)
  const [starFilter, setStarFilter] = useState(starsParam || '')
  const [priceFilter, setPriceFilter] = useState('')
  const [localKeyword, setLocalKeyword] = useState(keyword)
  const debouncedKeyword = useDebouncedValue(localKeyword, 500)

  const starLevel = starFilter === '' ? undefined : starFilter
  const priceRange = priceFilter
  const [minPrice, maxPrice] = priceRange.includes('-')
    ? priceRange.split('-')
    : ['', '']

  useEffect(() => {
    setLocalKeyword(keyword)
  }, [keyword])

  const loadPage = useCallback(
    async (pageNum: number, append: boolean) => {
      const res = await fetchHotelList({
        keyword: debouncedKeyword || undefined,
        starLevel,
        city: cityParam || undefined,
        tags: tags || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        page: pageNum,
        pageSize: PAGE_SIZE,
      })
      if (res.code !== 0 || !res.data) return []
      const items = res.data.list || []
      if (append) setList((prev) => (pageNum === 1 ? items : [...prev, ...items]))
      else setList(items)
      setFinished(items.length < PAGE_SIZE)
      return items
    },
    [debouncedKeyword, starLevel, cityParam, tags, minPrice, maxPrice, checkIn, checkOut]
  )

  const onLoadMore = async (_isRetry?: boolean) => {
    if (loading || finished) return
    setLoading(true)
    try {
      const nextPage = page + 1
      const items = await loadPage(nextPage, true)
      if (items.length > 0) setPage(nextPage)
    } catch (e) {
      Toast.fail('加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    setFinished(false)
    setList([])
    setLoading(true)
    loadPage(1, true)
      .catch(() => Toast.fail('加载失败'))
      .finally(() => setLoading(false))
  }, [debouncedKeyword, starLevel])

  const loadFirstPage = useCallback(async () => {
    setRefreshing(true)
    setPage(1)
    setFinished(false)
    try {
      await loadPage(1, false)
    } catch {
      Toast.fail('加载失败')
    } finally {
      setRefreshing(false)
    }
  }, [loadPage])

  const goSearch = () => {
    navigate('/h5', { state: { fromList: true } })
  }

  const dateText =
    checkIn && checkOut ? `${checkIn} 至 ${checkOut}` : checkIn ? `${checkIn} 入住` : '请选择日期'

  return (
    <div className="h5-list-page">
      <div style={{ background: '#fff', borderBottom: '1px solid #ebedf0', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button type="button" onClick={() => navigate(-1)} style={{ border: 'none', background: 'transparent', fontSize: 18, lineHeight: 1 }}>
          ←
        </button>
        <div style={{ fontSize: 16, fontWeight: 600 }}>酒店列表</div>
      </div>

      {/* 顶部核心条件筛选头：城市、入住/离店、关键词（带 500ms 防抖） */}
      <div className="h5-list-header">
        <div className="h5-list-header-row">
          <button type="button" className="h5-list-header-item" onClick={goSearch}>
            <span className="h5-list-header-label">城市</span>
            <span className="h5-list-header-value">{city || '请选择'}</span>
          </button>
          <button type="button" className="h5-list-header-item" onClick={goSearch}>
            <span className="h5-list-header-label">入住/离店</span>
            <span className="h5-list-header-value h5-list-header-value--ellipsis">{dateText}</span>
          </button>
        </div>
        <div className="h5-list-keyword-wrap">
          <input
            value={localKeyword}
            onChange={(e) => setLocalKeyword(e.target.value)}
            placeholder="位置/品牌/酒店名"
            className="h5-list-keyword-field"
          />
        </div>
      </div>

      {/* 详细筛选：星级、价格（使用原生 select，避免组件兼容导致运行时白屏） */}
      <div className="h5-list-dropdown" style={{ background: '#fff', padding: '8px 16px', display: 'flex', gap: 8 }}>
        <select
          value={starFilter}
          onChange={(e) => setStarFilter(e.target.value)}
          style={{ flex: 1, height: 32, borderRadius: 8 }}
        >
          {STAR_OPTIONS.map((o) => (
            <option key={o.value || 'star-all'} value={o.value}>{o.text}</option>
          ))}
        </select>
        <select
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          style={{ flex: 1, height: 32, borderRadius: 8 }}
        >
          {PRICE_OPTIONS.map((o) => (
            <option key={o.value || 'price-all'} value={o.value}>{o.text}</option>
          ))}
        </select>
        <button type="button" onClick={loadFirstPage} style={{ height: 32, borderRadius: 8, padding: '0 12px' }}>
          筛选
        </button>
      </div>

      <div className="h5-list-content">
        {list.length === 0 && !loading && !refreshing ? (
          <div className="h5-list-empty">暂无酒店</div>
        ) : (
          <ul className="h5-list-ul">
            {list.map((item) => (
              <li key={item.id} className="h5-list-li">
                <HotelCardWithOptimization hotel={item} />
              </li>
            ))}
          </ul>
        )}
        <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
          {finished ? (
            <span style={{ color: '#999' }}>没有更多了</span>
          ) : (
            <button
              type="button"
              onClick={() => onLoadMore()}
              disabled={loading}
              style={{ height: 34, borderRadius: 8, padding: '0 14px' }}
            >
              {loading ? '加载中…' : '加载更多'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

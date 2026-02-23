import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  NavBar,
  PullRefresh,
  List,
  DropdownMenu,
  Empty,
  Toast,
} from 'react-vant'
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
const STAR_OPTIONS = [
  { text: '不限', value: '' },
  { text: '五星', value: '5' },
  { text: '四星', value: '4' },
  { text: '三星', value: '3' },
  { text: '二星及以下', value: '1' },
]
const PRICE_OPTIONS = [
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
  const city = searchParams.get('city') ?? '上海'
  const checkIn = searchParams.get('checkIn') ?? ''
  const checkOut = searchParams.get('checkOut') ?? ''
  const starsParam = searchParams.get('stars') ?? ''

  const [list, setList] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [finished, setFinished] = useState(false)
  const [dropdownValue, setDropdownValue] = useState<Record<string, string | number>>({
    star: starsParam || '',
    price: '',
  })

  const starLevel = dropdownValue.star === '' ? undefined : String(dropdownValue.star)

  const loadPage = useCallback(
    async (pageNum: number, append: boolean) => {
      const res = await fetchHotelList({
        keyword: keyword || undefined,
        starLevel,
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
    [keyword, starLevel]
  )

  const onRefresh = async () => {
    setRefreshing(true)
    setPage(1)
    setFinished(false)
    try {
      await loadPage(1, true)
    } catch (e) {
      Toast.fail('刷新失败')
    } finally {
      setRefreshing(false)
    }
  }

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
  }, [keyword, starLevel])

  const goSearch = () => {
    navigate('/h5', { state: { fromList: true } })
  }

  const dateText =
    checkIn && checkOut ? `${checkIn} 至 ${checkOut}` : checkIn ? `${checkIn} 入住` : '请选择日期'

  return (
    <div className="h5-list-page">
      <NavBar title="酒店列表" leftArrow onBack={() => navigate(-1)} />

      {/* 顶部核心条件筛选头：城市、入住/离店、搜索 */}
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
          <button type="button" className="h5-list-header-item" onClick={goSearch}>
            <span className="h5-list-header-label">关键词</span>
            <span className="h5-list-header-value h5-list-header-value--ellipsis">
              {keyword || '位置/品牌/酒店名'}
            </span>
          </button>
        </div>
      </div>

      {/* 详细筛选：星级、价格（Vant DropdownMenu） */}
      <DropdownMenu
        value={dropdownValue}
        onChange={setDropdownValue}
        className="h5-list-dropdown"
      >
        <DropdownMenu.Item name="star" title="星级" options={STAR_OPTIONS} />
        <DropdownMenu.Item name="price" title="价格" options={PRICE_OPTIONS} />
      </DropdownMenu>

      {/* 下拉刷新 + 上滑加载（Vant PullRefresh + List） */}
      <PullRefresh onRefresh={onRefresh} disabled={loading}>
        <List
          finished={finished}
          loading={loading}
          loadingText="加载中…"
          finishedText="没有更多了"
          onLoad={onLoadMore}
          className="h5-list-content"
        >
          {list.length === 0 && !loading && !refreshing ? (
            <Empty description="暂无酒店" className="h5-list-empty" />
          ) : (
            <ul className="h5-list-ul">
              {list.map((item) => (
                <li key={item.id} className="h5-list-li">
                  {/* 长列表优化：仅视口内渲染完整卡片，详见 HotelCardWithOptimization */}
                  <HotelCardWithOptimization hotel={item} />
                </li>
              ))}
            </ul>
          )}
        </List>
      </PullRefresh>
    </div>
  )
}

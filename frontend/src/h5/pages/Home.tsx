import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import {
  ActionSheet,
  Image,
  Cell,
  CellGroup,
  Field,
  Button,
  Tag,
  Popup,
  Calendar,
  Toast,
} from 'react-vant'
import { formatDate, nights } from '@/utils/date'
import { createPlaceholderImage } from '@/utils/placeholderImage'
import '@/styles/h5-home.css'

const IconLocation = () => <span className="h5-home-cell-icon" aria-hidden>📍</span>
const IconCalendar = () => <span className="h5-home-cell-icon" aria-hidden>📅</span>
const IconStar = () => <span className="h5-home-cell-icon" aria-hidden>⭐</span>

const STAR_OPTIONS = [
  { name: '一星', value: 1 },
  { name: '二星', value: 2 },
  { name: '三星', value: 3 },
  { name: '四星', value: 4 },
  { name: '五星', value: 5 },
]

const QUICK_TAGS = [
  { key: '亲子', label: '亲子' },
  { key: '豪华', label: '豪华' },
  { key: '免费停车', label: '免费停车' },
  { key: '含早', label: '含早' },
  { key: '近地铁', label: '近地铁' },
  { key: '温泉', label: '温泉' },
  { key: '海景', label: '海景' },
  { key: '泳池', label: '泳池' },
  { key: '健身房', label: '健身房' },
  { key: '网红', label: '网红' },
  { key: '设计师', label: '设计师' },
  { key: '宠物友好', label: '宠物友好' },
  { key: '商务', label: '商务' },
  { key: '度假', label: '度假' },
  { key: '无烟', label: '无烟' },
]

const BANNER_PLACEHOLDER = createPlaceholderImage(750, 280, 'Yisu Hotel')

const CITIES = [
  '杭州',
  '上海',
  '北京',
  '深圳',
  '广州',
  '成都',
  '西安',
  '南京',
  '苏州',
  '厦门',
  '三亚',
  '青岛',
  '重庆',
  '武汉',
  '长沙',
  '天津',
]

export default function Home() {
  const navigate = useNavigate()
  const [city, setCity] = useState('杭州')
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebouncedValue(keyword, 500)
  const [calendarVisible, setCalendarVisible] = useState(false)
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null)
  const [starSheetVisible, setStarSheetVisible] = useState(false)
  const [selectedStars, setSelectedStars] = useState<number[]>([])
  const [quickSelected, setQuickSelected] = useState<string[]>([])
  const [citySheetVisible, setCitySheetVisible] = useState(false)

  const cityActions = useMemo(() => {
    return CITIES.map((c) => ({ name: c, color: c === city ? '#ee0a24' : undefined }))
  }, [city])

  const dateRangeText = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return '请选择入住与离店日期'
    const [start, end] = dateRange
    const n = nights(start, end)
    return `${formatDate(start)} 至 ${formatDate(end)} · 共${n}晚`
  }, [dateRange])

  const starText = useMemo(() => {
    if (selectedStars.length === 0) return '不限'
    const sorted = [...selectedStars].sort((a, b) => a - b)
    return sorted.map((v) => `${v}星`).join('、')
  }, [selectedStars])

  const handleCalendarConfirm = (value: Date | Date[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setDateRange([value[0], value[1]])
    }
    setCalendarVisible(false)
  }

  const toggleStar = (value: number) => {
    setSelectedStars((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const closeStarPopup = () => setStarSheetVisible(false)

  const toggleQuickTag = (key: string) => {
    setQuickSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handleSearch = () => {
    const checkIn = dateRange?.[0] ? formatDate(dateRange[0]) : ''
    const checkOut = dateRange?.[1] ? formatDate(dateRange[1]) : ''
    const kw = (debouncedKeyword ?? keyword).toString().trim()
    const params: Record<string, string> = {
      keyword: kw,
      city,
      checkIn,
      checkOut,
      stars: selectedStars.length ? selectedStars.sort((a, b) => a - b).join(',') : '',
      tags: quickSelected.join(','),
    }
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v) query.set(k, v)
    })
    navigate(`/h5/list?${query.toString()}`, { state: { keyword: kw, city, checkIn, checkOut, stars: selectedStars, tags: quickSelected } })
  }

  const handleBannerClick = () => {
    navigate('/h5/detail/mock')
  }

  const minDate = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const maxDate = useMemo(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() + 1)
    return d
  }, [])

  const calendarValue = useMemo(() => {
    if (!dateRange?.[0]) return undefined
    if (dateRange[1]) return dateRange
    return dateRange[0]
  }, [dateRange])

  return (
    <div className="h5-home">
      {/* 顶部 Banner */}
      <div className="h5-home-banner" onClick={handleBannerClick}>
        <Image
          src={BANNER_PLACEHOLDER}
          alt="酒店推荐"
          fit="cover"
          width="100%"
          height={140}
          className="h5-home-banner-img"
        />
        <div className="h5-home-banner-mask">点击进入详情</div>
      </div>

      {/* 核心查询区域 */}
      <div className="h5-home-form">
        <CellGroup inset>
          <Cell
            title="当前地点"
            value={city}
            isLink
            icon={<IconLocation />}
            onClick={() => setCitySheetVisible(true)}
          />
          <Field
            value={keyword}
            onChange={setKeyword}
            placeholder="搜索位置、品牌或酒店名"
            clearable
            className="h5-home-field"
          />
          <Cell
            title="入住日期"
            value={dateRangeText}
            isLink
            icon={<IconCalendar />}
            onClick={() => setCalendarVisible(true)}
          />
          <Cell
            title="价格/星级"
            value={starText}
            isLink
            icon={<IconStar />}
            onClick={() => setStarSheetVisible(true)}
          />
        </CellGroup>

        {/* 快捷标签 */}
        <div className="h5-home-tags">
          <div className="h5-home-tags-label">快捷筛选</div>
          <div className="h5-home-tags-wrap">
            {QUICK_TAGS.map((t) => (
              <Tag
                key={t.key}
                type={quickSelected.includes(t.key) ? 'primary' : 'default'}
                plain={!quickSelected.includes(t.key)}
                size="medium"
                className="h5-home-tag"
                onClick={() => toggleQuickTag(t.key)}
              >
                {t.label}
              </Tag>
            ))}
          </div>
        </div>

        <Button
          type="primary"
          block
          round
          size="large"
          className="h5-home-search-btn"
          onClick={handleSearch}
        >
          查询酒店
        </Button>
      </div>

      {/* 入住日期日历（Vant Calendar 自带弹层） */}
      <Calendar
        visible={calendarVisible}
        poppable
        type="range"
        value={calendarValue}
        minDate={minDate}
        maxDate={maxDate}
        showConfirm
        confirmText="确定"
        allowSameDay={false}
        onConfirm={handleCalendarConfirm}
        onClose={() => setCalendarVisible(false)}
      />

      {/* 星级多选 Popup */}
      <Popup
        visible={starSheetVisible}
        position="bottom"
        round
        onClose={() => setStarSheetVisible(false)}
      >
        <div className="h5-home-star-popup">
          <div className="h5-home-star-title">选择星级（可多选）</div>
          <div className="h5-home-star-options">
            {STAR_OPTIONS.map((o) => (
              <Tag
                key={o.value}
                type={selectedStars.includes(o.value) ? 'primary' : 'default'}
                size="large"
                className="h5-home-star-tag"
                onClick={() => toggleStar(o.value)}
              >
                {o.name}
              </Tag>
            ))}
          </div>
          <Button block type="primary" round onClick={closeStarPopup}>
            确定
          </Button>
        </div>
      </Popup>

      <ActionSheet
        visible={citySheetVisible}
        actions={cityActions}
        cancelText="取消"
        onSelect={(action) => {
          setCity(action.name)
          setCitySheetVisible(false)
          Toast.success(`已选择：${action.name}`)
        }}
        onCancel={() => setCitySheetVisible(false)}
      />
    </div>
  )
}

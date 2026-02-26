import { Router } from 'express'
import { success, fail } from '../utils/response.js'
import {
  hotels,
  HOTEL_STATUS,
  nextId,
  tokenStore,
  persistStore,
} from '../store/index.js'
import { requireAuth, requireMerchant } from '../middleware/auth.js'

const router = Router()

const HOLIDAY_MMDD = new Set(['01-01', '05-01', '10-01'])

function parseDateStr(value) {
  if (!value || typeof value !== 'string') return null
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const d = Number(m[3])
  const dt = new Date(y, mo, d)
  if (Number.isNaN(dt.getTime())) return null
  return dt
}

function getStayDates(checkIn, checkOut) {
  const start = parseDateStr(checkIn)
  const end = parseDateStr(checkOut)
  if (!start || !end || end <= start) return []
  const days = []
  const cursor = new Date(start)
  while (cursor < end) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

function getDynamicMultiplier(checkIn, checkOut) {
  const days = getStayDates(checkIn, checkOut)
  if (days.length === 0) return 1
  const total = days.reduce((sum, day) => {
    let rate = 1
    const dayOfWeek = day.getDay()
    if (dayOfWeek === 5 || dayOfWeek === 6) rate += 0.2 // 周五、周六
    const mmdd = `${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
    if (HOLIDAY_MMDD.has(mmdd)) rate += 0.3 // 固定节日
    return sum + rate
  }, 0)
  return Number((total / days.length).toFixed(2))
}

function applyDynamicPricing(hotel, multiplier) {
  const rate = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1
  const roomTypes = (hotel.roomTypes || []).map((room) => ({
    ...room,
    price: Math.round((Number(room.price) || 0) * rate),
  }))
  return {
    ...hotel,
    roomTypes,
    pricing: {
      multiplier: rate,
    },
  }
}

/**
 * GET /api/hotels
 * 用户端列表：仅返回已发布(approved)的酒店，支持 keyword、starLevel、page、pageSize
 * 商户/管理员可通过 query.manage=1 查看自己或全部（管理员）酒店
 */
router.get('/', (req, res) => {
  const {
    keyword,
    starLevel,
    city,
    tags,
    minPrice,
    maxPrice,
    checkIn,
    checkOut,
    page = 1,
    pageSize = 10,
    manage,
  } = req.query
  const auth = req.headers.authorization
  const token = auth && auth.startsWith('Bearer ') ? auth.slice(7) : null
  const session = token ? tokenStore.get(token) : null

  let list = [...hotels]

  // 用户端：只显示已发布
  if (!manage || !session) {
    list = list.filter((h) => h.status === HOTEL_STATUS.APPROVED)
  } else if (session.role === 'merchant') {
    list = list.filter((h) => h.merchantId === session.userId)
  }
  // admin + manage 看全部，不筛

  if (keyword) {
    const k = keyword.trim().toLowerCase()
    list = list.filter(
      (h) =>
        (h.nameZh && h.nameZh.toLowerCase().includes(k)) ||
        (h.nameEn && h.nameEn.toLowerCase().includes(k)) ||
        (h.address && h.address.toLowerCase().includes(k))
    )
  }
  if (starLevel != null && starLevel !== '') {
    const stars = String(starLevel)
      .split(',')
      .map((v) => Number(v))
      .filter((v) => !Number.isNaN(v))
    if (stars.length > 0) {
      list = list.filter((h) => stars.includes(h.starLevel))
    }
  }

  if (city && String(city).trim()) {
    const c = String(city).trim().toLowerCase()
    list = list.filter((h) => (h.address || '').toLowerCase().includes(c))
  }

  if (tags && String(tags).trim()) {
    const tagList = String(tags)
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean)
    if (tagList.length > 0) {
      list = list.filter((h) => {
        const nearby = (h.nearby || '').toLowerCase()
        return tagList.some((t) => nearby.includes(t))
      })
    }
  }

  // 动态价格：根据入住日期按夜晚计算均值倍率（周末/节假日）
  const dynamicMultiplier = getDynamicMultiplier(checkIn, checkOut)
  list = list.map((h) => applyDynamicPricing(h, dynamicMultiplier))

  if (minPrice !== undefined || maxPrice !== undefined) {
    const min = minPrice !== undefined && minPrice !== '' ? Number(minPrice) : undefined
    const max = maxPrice !== undefined && maxPrice !== '' ? Number(maxPrice) : undefined
    list = list.filter((h) => {
      const prices = (h.roomTypes || []).map((r) => Number(r.price) || 0)
      const hotelMin = prices.length > 0 ? Math.min(...prices) : 0
      if (min !== undefined && !Number.isNaN(min) && hotelMin < min) return false
      if (max !== undefined && !Number.isNaN(max) && hotelMin > max) return false
      return true
    })
  }

  const total = list.length
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10))
  const start = (pageNum - 1) * size
  const data = list.slice(start, start + size)

  return success(res, {
    list: data,
    total,
    page: pageNum,
    pageSize: size,
    pricing: {
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      multiplier: dynamicMultiplier,
    },
  })
})

/**
 * GET /api/hotels/:id
 * 酒店详情（用户端仅能查已发布；商户可查自己的，管理员可查全部）
 */
router.get('/:id', (req, res) => {
  const { id } = req.params
  const { checkIn, checkOut } = req.query
  const auth = req.headers.authorization
  const token = auth && auth.startsWith('Bearer ') ? auth.slice(7) : null
  const session = token ? tokenStore.get(token) : null

  const hotel = hotels.find((h) => h.id === id)
  if (!hotel) return fail(res, '酒店不存在', 404, 404)

  const isOwn = session && hotel.merchantId === session.userId
  const isAdmin = session && session.role === 'admin'
  if (hotel.status !== HOTEL_STATUS.APPROVED && !isOwn && !isAdmin) {
    return fail(res, '酒店不存在或未发布', 404, 404)
  }

  // 房型按价格从低到高（可按日期动态计价）
  const dynamicMultiplier = getDynamicMultiplier(checkIn, checkOut)
  const pricedHotel = applyDynamicPricing(hotel, dynamicMultiplier)
  const roomTypes = [...(pricedHotel.roomTypes || [])].sort((a, b) => (a.price || 0) - (b.price || 0))
  return success(res, {
    ...pricedHotel,
    roomTypes,
    pricing: {
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      multiplier: dynamicMultiplier,
    },
  })
})

/**
 * POST /api/hotels  商户上传酒店
 */
router.post('/', requireAuth, requireMerchant, (req, res) => {
  const body = req.body || {}
  const { nameZh, nameEn, address, starLevel, roomTypes, openTime } = body

  if (!nameZh || !address || !openTime) {
    return fail(res, '缺少必填：nameZh, address, openTime')
  }
  const rooms = Array.isArray(roomTypes) ? roomTypes : []
  if (rooms.length === 0) {
    return fail(res, '至少需要一个房型（roomTypes）')
  }

  const id = nextId('hotel')
  const now = new Date().toISOString()
  const hotel = {
    id,
    merchantId: req.user.userId,
    nameZh: nameZh.trim(),
    nameEn: (nameEn || '').trim() || nameZh.trim(),
    address: address.trim(),
    starLevel: Math.min(5, Math.max(1, parseInt(starLevel, 10) || 3)),
    roomTypes: rooms.map((r, i) => ({
      id: `r_${id}_${i + 1}`,
      name: (r.name || r.nameZh || '房型').trim(),
      price: Math.max(0, Number(r.price) || 0),
    })),
    openTime: openTime.trim(),
    status: HOTEL_STATUS.PENDING,
    rejectReason: null,
    nearby: body.nearby != null ? String(body.nearby).trim() : '',
    images: Array.isArray(body.images) ? body.images : [],
    createdAt: now,
    updatedAt: now,
  }
  hotels.push(hotel)
  persistStore()
  return success(res, hotel, '创建成功')
})

/**
 * PUT /api/hotels/:id  商户编辑酒店（仅能编辑自己的，且审核中或已拒绝的可编辑；已发布/下线可编辑信息但不改状态）
 */
router.put('/:id', requireAuth, requireMerchant, (req, res) => {
  const { id } = req.params
  const body = req.body || {}
  const hotel = hotels.find((h) => h.id === id)
  if (!hotel) return fail(res, '酒店不存在', 404, 404)
  if (hotel.merchantId !== req.user.userId) {
    return fail(res, '无权限编辑该酒店', 403, 403)
  }

  const roomTypes = Array.isArray(body.roomTypes) ? body.roomTypes : hotel.roomTypes
  const updated = {
    ...hotel,
    nameZh: body.nameZh !== undefined ? String(body.nameZh).trim() : hotel.nameZh,
    nameEn: body.nameEn !== undefined ? String(body.nameEn).trim() : hotel.nameEn,
    address: body.address !== undefined ? String(body.address).trim() : hotel.address,
    starLevel:
      body.starLevel !== undefined
        ? Math.min(5, Math.max(1, parseInt(body.starLevel, 10) || hotel.starLevel))
        : hotel.starLevel,
    openTime: body.openTime !== undefined ? String(body.openTime).trim() : hotel.openTime,
    roomTypes: roomTypes.map((r, i) => ({
      id: r.id || `r_${id}_${i + 1}`,
      name: (r.name || r.nameZh || '房型').trim(),
      price: Math.max(0, Number(r.price) || 0),
    })),
    images: Array.isArray(body.images) ? body.images : hotel.images,
    nearby: body.nearby !== undefined ? String(body.nearby).trim() : hotel.nearby,
    updatedAt: new Date().toISOString(),
  }
  const idx = hotels.findIndex((h) => h.id === id)
  hotels[idx] = updated
  persistStore()
  const roomSorted = [...updated.roomTypes].sort((a, b) => a.price - b.price)
  return success(res, { ...updated, roomTypes: roomSorted }, '更新成功')
})

export default router

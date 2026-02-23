import { Router } from 'express'
import { success, fail } from '../utils/response.js'
import {
  hotels,
  HOTEL_STATUS,
  nextId,
  tokenStore,
} from '../store/index.js'
import { requireAuth, requireMerchant } from '../middleware/auth.js'

const router = Router()

/**
 * GET /api/hotels
 * 用户端列表：仅返回已发布(approved)的酒店，支持 keyword、starLevel、page、pageSize
 * 商户/管理员可通过 query.manage=1 查看自己或全部（管理员）酒店
 */
router.get('/', (req, res) => {
  const { keyword, starLevel, page = 1, pageSize = 10, manage } = req.query
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
    const star = Number(starLevel)
    if (!Number.isNaN(star)) list = list.filter((h) => h.starLevel === star)
  }

  const total = list.length
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10))
  const start = (pageNum - 1) * size
  const data = list.slice(start, start + size)

  return success(res, { list: data, total, page: pageNum, pageSize: size })
})

/**
 * GET /api/hotels/:id
 * 酒店详情（用户端仅能查已发布；商户可查自己的，管理员可查全部）
 */
router.get('/:id', (req, res) => {
  const { id } = req.params
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

  // 房型按价格从低到高
  const roomTypes = [...(hotel.roomTypes || [])].sort((a, b) => (a.price || 0) - (b.price || 0))
  return success(res, { ...hotel, roomTypes })
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
  const roomSorted = [...updated.roomTypes].sort((a, b) => a.price - b.price)
  return success(res, { ...updated, roomTypes: roomSorted }, '更新成功')
})

export default router

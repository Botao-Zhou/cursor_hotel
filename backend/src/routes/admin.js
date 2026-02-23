import { Router } from 'express'
import { success, fail } from '../utils/response.js'
import { hotels, HOTEL_STATUS } from '../store/index.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth, requireAdmin)

/**
 * GET /api/admin/hotels
 * 管理员：获取全部酒店（含审核中/拒绝/下线），支持 status、keyword 筛选
 */
router.get('/hotels', (req, res) => {
  const { status, keyword, page = 1, pageSize = 20 } = req.query
  let list = [...hotels]
  if (status) {
    list = list.filter((h) => h.status === status)
  }
  if (keyword && String(keyword).trim()) {
    const k = String(keyword).trim().toLowerCase()
    list = list.filter(
      (h) =>
        (h.nameZh && h.nameZh.toLowerCase().includes(k)) ||
        (h.nameEn && h.nameEn.toLowerCase().includes(k)) ||
        (h.address && h.address.toLowerCase().includes(k))
    )
  }
  const total = list.length
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20))
  const start = (pageNum - 1) * size
  return success(res, {
    list: list.slice(start, start + size),
    total,
    page: pageNum,
    pageSize: size,
  })
})

/**
 * POST /api/admin/hotels/:id/approve
 * 审核通过并发布
 */
router.post('/hotels/:id/approve', (req, res) => {
  const { id } = req.params
  const hotel = hotels.find((h) => h.id === id)
  if (!hotel) return fail(res, '酒店不存在', 404, 404)
  hotel.status = HOTEL_STATUS.APPROVED
  hotel.rejectReason = null
  hotel.updatedAt = new Date().toISOString()
  return success(res, hotel, '已通过并发布')
})

/**
 * POST /api/admin/hotels/:id/reject
 * 审核不通过，body: { reason }
 */
router.post('/hotels/:id/reject', (req, res) => {
  const { id } = req.params
  const reason = (req.body && req.body.reason) ? String(req.body.reason).trim() : '未说明原因'
  const hotel = hotels.find((h) => h.id === id)
  if (!hotel) return fail(res, '酒店不存在', 404, 404)
  hotel.status = HOTEL_STATUS.REJECTED
  hotel.rejectReason = reason
  hotel.updatedAt = new Date().toISOString()
  return success(res, hotel, '已拒绝')
})

/**
 * POST /api/admin/hotels/:id/offline
 * 下线（非删除，可恢复）
 */
router.post('/hotels/:id/offline', (req, res) => {
  const { id } = req.params
  const hotel = hotels.find((h) => h.id === id)
  if (!hotel) return fail(res, '酒店不存在', 404, 404)
  hotel.status = HOTEL_STATUS.OFFLINE
  hotel.updatedAt = new Date().toISOString()
  return success(res, hotel, '已下线')
})

/**
 * POST /api/admin/hotels/:id/restore
 * 恢复上线（从下线恢复为已发布）
 */
router.post('/hotels/:id/restore', (req, res) => {
  const { id } = req.params
  const hotel = hotels.find((h) => h.id === id)
  if (!hotel) return fail(res, '酒店不存在', 404, 404)
  if (hotel.status !== HOTEL_STATUS.OFFLINE) {
    return fail(res, '仅能恢复已下线的酒店')
  }
  hotel.status = HOTEL_STATUS.APPROVED
  hotel.updatedAt = new Date().toISOString()
  return success(res, hotel, '已恢复上线')
})

export default router

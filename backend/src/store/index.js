/**
 * 本地 JSON 模拟数据库：用户、酒店、登录 token
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { hashPassword, isPasswordHashed } from '../utils/password.js'

// 酒店审核/上下线状态
export const HOTEL_STATUS = {
  PENDING: 'pending',     // 审核中
  APPROVED: 'approved',   // 通过已发布
  REJECTED: 'rejected',   // 不通过
  OFFLINE: 'offline',     // 已下线（可恢复）
}

// 用户角色
export const USER_ROLE = {
  MERCHANT: 'merchant',
  ADMIN: 'admin',
}

function generateSeedHotels() {
  const CITY_LIST = [
    { city: '杭州', region: '浙江省杭州市' },
    { city: '上海', region: '上海市' },
    { city: '北京', region: '北京市' },
    { city: '深圳', region: '广东省深圳市' },
    { city: '广州', region: '广东省广州市' },
    { city: '成都', region: '四川省成都市' },
    { city: '西安', region: '陕西省西安市' },
    { city: '南京', region: '江苏省南京市' },
    { city: '苏州', region: '江苏省苏州市' },
    { city: '厦门', region: '福建省厦门市' },
    { city: '三亚', region: '海南省三亚市' },
    { city: '青岛', region: '山东省青岛市' },
    { city: '重庆', region: '重庆市' },
    { city: '武汉', region: '湖北省武汉市' },
    { city: '长沙', region: '湖南省长沙市' },
    { city: '天津', region: '天津市' },
  ]

  const TYPES = [
    { zh: '精选酒店', en: 'Select Hotel', baseStar: 4, tag: '网红' },
    { zh: '商务酒店', en: 'Business Hotel', baseStar: 3, tag: '商务' },
    { zh: '度假酒店', en: 'Resort Hotel', baseStar: 5, tag: '度假' },
    { zh: '设计师酒店', en: 'Designer Hotel', baseStar: 4, tag: '设计师' },
    { zh: '亲子酒店', en: 'Family Hotel', baseStar: 4, tag: '亲子' },
    { zh: '快捷酒店', en: 'Budget Hotel', baseStar: 2, tag: '近地铁' },
  ]

  const PRICE_LADDER = [139, 169, 199, 229, 259, 299, 349, 399, 459, 499, 559, 599, 699, 799, 899, 999, 1299, 1599, 1899, 2199]

  const extraTags = [
    '免费停车',
    '含早',
    '温泉',
    '海景',
    '泳池',
    '健身房',
    '宠物友好',
    '无烟',
    '豪华',
  ]

  let idCounter = 1
  const hotels = []

  // 每个城市 12 家：10 家 approved + 2 家用于状态分支测试（pending/offline/rejected）
  for (const { city, region } of CITY_LIST) {
    for (let i = 1; i <= 12; i++) {
      const type = TYPES[(i - 1) % TYPES.length]
      const hotelId = `h${idCounter++}`

      const status =
        i <= 10
          ? HOTEL_STATUS.APPROVED
          : i === 11
            ? HOTEL_STATUS.PENDING
            : (idCounter % 2 === 0 ? HOTEL_STATUS.OFFLINE : HOTEL_STATUS.REJECTED)

      const rejectReason = status === HOTEL_STATUS.REJECTED ? '模拟：审核资料不全/图片不清晰' : null

      const starLevel = Math.min(5, Math.max(1, type.baseStar + ((i % 3) - 1)))

      const base = PRICE_LADDER[(i * 3 + city.length) % PRICE_LADDER.length]
      const price1 = Math.max(99, base + (starLevel - 3) * 120)
      const price2 = price1 + 80 + (i % 4) * 60

      const tags = new Set([city, type.tag])
      // 让不同酒店覆盖更多标签组合
      if (i % 2 === 0) tags.add('免费停车')
      if (i % 3 === 0) tags.add('含早')
      if (i % 4 === 0) tags.add('近地铁')
      if (i % 5 === 0) tags.add('亲子')
      if (i % 6 === 0) tags.add('豪华')
      if (i % 7 === 0) tags.add('温泉')
      if (i % 8 === 0) tags.add('海景')
      if (i % 9 === 0) tags.add('泳池')
      if (i % 10 === 0) tags.add('健身房')
      if (i % 11 === 0) tags.add('宠物友好')
      if (i % 12 === 0) tags.add('无烟')
      // 再额外塞 1 个标签，保证分布更散
      tags.add(extraTags[(i + city.charCodeAt(0)) % extraTags.length])

      const now = new Date(Date.UTC(2024, 0, 1 + (idCounter % 200), 10, 0, 0)).toISOString()

      hotels.push({
        id: hotelId,
        merchantId: 'u1',
        nameZh: `易宿·${city}${type.zh} ${String(i).padStart(2, '0')}号`,
        nameEn: `Yisu ${city} ${type.en} #${String(i).padStart(2, '0')}`,
        address: `${region}${city === '上海' || city === '北京' || city === '天津' || city === '重庆' ? '' : ''}中心区示例路 ${100 + i} 号`,
        starLevel,
        roomTypes: [
          { id: `r_${hotelId}_1`, name: '标准大床', price: price1 },
          { id: `r_${hotelId}_2`, name: '高级双床', price: price2 },
        ],
        openTime: `20${15 + (i % 10)}-0${((i % 9) + 1)}-0${((i % 7) + 1)}`,
        status,
        rejectReason,
        nearby: Array.from(tags).join('、'),
        images: [],
        createdAt: now,
        updatedAt: now,
      })
    }
  }

  return hotels
}

function createDefaultData() {
  return {
    users: [
      { id: 'u1', username: 'merchant1', password: hashPassword('123456'), role: USER_ROLE.MERCHANT },
      { id: 'u2', username: 'admin1', password: hashPassword('123456'), role: USER_ROLE.ADMIN },
    ],
    hotels: generateSeedHotels(),
  }
}

function normalizeData(raw) {
  const fallback = createDefaultData()
  const listUsers = Array.isArray(raw?.users) ? raw.users : fallback.users
  const listHotels = Array.isArray(raw?.hotels) ? raw.hotels : fallback.hotels
  const usersWithHash = listUsers.map((u) => ({
    ...u,
    password: isPasswordHashed(u.password) ? u.password : hashPassword(u.password || ''),
  }))
  return { users: usersWithHash, hotels: listHotels }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_FILE = path.resolve(__dirname, '../db/data.json')

function ensureDataFile() {
  const dir = path.dirname(DB_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(DB_FILE)) {
    const seed = createDefaultData()
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8')
  }
}

function loadData() {
  ensureDataFile()
  try {
    const text = fs.readFileSync(DB_FILE, 'utf-8')
    const parsed = JSON.parse(text)
    const normalized = normalizeData(parsed)
    fs.writeFileSync(DB_FILE, JSON.stringify(normalized, null, 2), 'utf-8')
    return normalized
  } catch {
    const seed = createDefaultData()
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8')
    return seed
  }
}

const persisted = loadData()

// 用户表：id, username, password(hash), role
export const users = persisted.users

// 酒店表：符合文档必须维度 + 状态、归属等
export const hotels = persisted.hotels

// token -> { userId, role }，用于登录态
export const tokenStore = new Map()

export function persistStore() {
  const payload = { users, hotels }
  fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8')
}

export function nextId(prefix) {
  const list = prefix === 'user' ? users : hotels
  const ids = list.map((x) => x.id)
  const num = ids
    .filter((id) => id.startsWith(prefix === 'user' ? 'u' : 'h'))
    .map((id) => parseInt(id.slice(1), 10) || 0)
  const max = num.length ? Math.max(...num) : 0
  return `${prefix === 'user' ? 'u' : 'h'}${max + 1}`
}

export function nextRoomId(hotel) {
  const ids = (hotel.roomTypes || []).map((r) => r.id || '').filter(Boolean)
  const num = ids.map((id) => parseInt(id.replace(/\D/g, ''), 10) || 0)
  const max = num.length ? Math.max(...num) : 0
  return `r${max + 1}`
}

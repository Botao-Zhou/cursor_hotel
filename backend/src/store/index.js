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

function createDefaultData() {
  return {
    users: [
      { id: 'u1', username: 'merchant1', password: hashPassword('123456'), role: USER_ROLE.MERCHANT },
      { id: 'u2', username: 'admin1', password: hashPassword('123456'), role: USER_ROLE.ADMIN },
    ],
    hotels: [
      {
        id: 'h1',
        merchantId: 'u1',
        nameZh: '易宿精选·西湖店',
        nameEn: 'Yisu Select West Lake',
        address: '浙江省杭州市西湖区文三路 100 号',
        starLevel: 4,
        roomTypes: [
          { id: 'r1', name: '大床房', price: 388 },
          { id: 'r2', name: '双床标间', price: 428 },
          { id: 'r3', name: '家庭套房', price: 688 },
        ],
        openTime: '2020-06-01',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '西湖景区、黄龙体育中心、文三路数码商圈、亲子、免费停车、含早、近地铁',
        images: [],
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
      },
      {
        id: 'h2',
        merchantId: 'u1',
        nameZh: '易宿·灵隐度假酒店',
        nameEn: 'Yisu Lingyin Resort',
        address: '浙江省杭州市西湖区灵隐路 18 号',
        starLevel: 5,
        roomTypes: [
          { id: 'r4', name: '山景大床', price: 888 },
          { id: 'r5', name: '庭院套房', price: 1288 },
        ],
        openTime: '2021-03-20',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '灵隐寺、北高峰索道、梅家坞茶文化村、豪华、温泉、含早',
        images: [],
        createdAt: '2024-02-01T10:00:00.000Z',
        updatedAt: '2024-02-01T10:00:00.000Z',
      },
      {
        id: 'h3',
        merchantId: 'u1',
        nameZh: '易宿·钱江商务酒店',
        nameEn: 'Yisu Qianjiang Business',
        address: '浙江省杭州市江干区钱江路 200 号',
        starLevel: 3,
        roomTypes: [
          { id: 'r6', name: '标准单间', price: 268 },
          { id: 'r7', name: '标准双床', price: 298 },
        ],
        openTime: '2019-10-01',
        status: HOTEL_STATUS.PENDING,
        rejectReason: null,
        nearby: '近地铁、免费停车',
        images: [],
        createdAt: '2024-03-10T10:00:00.000Z',
        updatedAt: '2024-03-10T10:00:00.000Z',
      },
    ],
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

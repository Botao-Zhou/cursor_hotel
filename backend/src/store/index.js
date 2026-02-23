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
        nearby: '杭州、西湖景区、黄龙体育中心、文三路数码商圈、亲子、免费停车、含早、近地铁、无烟',
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
        nearby: '杭州、灵隐寺、北高峰索道、梅家坞茶文化村、豪华、温泉、含早、度假、网红',
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
        nearby: '杭州、商务、近地铁、免费停车',
        images: [],
        createdAt: '2024-03-10T10:00:00.000Z',
        updatedAt: '2024-03-10T10:00:00.000Z',
      },

      // 上海（覆盖：高端/低价/亲子/离线/拒绝/海景/泳池）
      {
        id: 'h4',
        merchantId: 'u1',
        nameZh: '上海浦东香格里拉大酒店',
        nameEn: 'Shangri-La Pudong, Shanghai',
        address: '上海市浦东新区富城路 33 号',
        starLevel: 5,
        roomTypes: [
          { id: 'r8', name: '豪华江景房', price: 1588 },
          { id: 'r9', name: '行政套房', price: 2588 },
        ],
        openTime: '2018-05-01',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '上海、陆家嘴、外滩、豪华、含早、近地铁、免费停车、泳池、健身房、无烟',
        images: [],
        createdAt: '2024-04-01T10:00:00.000Z',
        updatedAt: '2024-04-01T10:00:00.000Z',
      },
      {
        id: 'h5',
        merchantId: 'u1',
        nameZh: '汉庭酒店(上海静安寺店)',
        nameEn: 'Hanting Hotel Shanghai Jingan Temple',
        address: '上海市静安区延安中路 800 号',
        starLevel: 2,
        roomTypes: [
          { id: 'r10', name: '特价大床房', price: 199 },
          { id: 'r11', name: '标准双床房', price: 259 },
        ],
        openTime: '2015-11-11',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '上海、静安寺、近地铁、无烟、商务',
        images: [],
        createdAt: '2024-04-05T10:00:00.000Z',
        updatedAt: '2024-04-05T10:00:00.000Z',
      },
      {
        id: 'h6',
        merchantId: 'u1',
        nameZh: '上海迪士尼乐园酒店',
        nameEn: 'Shanghai Disneyland Hotel',
        address: '上海市浦东新区申迪西路 1009 号',
        starLevel: 5,
        roomTypes: [
          { id: 'r12', name: '奇妙客房', price: 1888 },
          { id: 'r13', name: '魔法套房', price: 2888 },
        ],
        openTime: '2016-06-16',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '上海、迪士尼度假区、亲子、豪华、含早、免费停车、网红',
        images: [],
        createdAt: '2024-04-20T10:00:00.000Z',
        updatedAt: '2024-04-20T10:00:00.000Z',
      },
      {
        id: 'h7',
        merchantId: 'u1',
        nameZh: '上海滨江海景酒店(试运营)',
        nameEn: 'Shanghai Riverside Seaview (Soft Opening)',
        address: '上海市浦东新区滨江大道 1888 号',
        starLevel: 4,
        roomTypes: [
          { id: 'r14', name: '海景大床房', price: 799 },
          { id: 'r15', name: '海景套房', price: 1299 },
        ],
        openTime: '2025-01-01',
        status: HOTEL_STATUS.OFFLINE,
        rejectReason: null,
        nearby: '上海、海景、泳池、健身房、度假',
        images: [],
        createdAt: '2024-05-01T10:00:00.000Z',
        updatedAt: '2024-05-01T10:00:00.000Z',
      },
      {
        id: 'h8',
        merchantId: 'u1',
        nameZh: '上海创意设计师酒店(未通过)',
        nameEn: 'Shanghai Designer Hotel (Rejected)',
        address: '上海市黄浦区新天地 66 号',
        starLevel: 4,
        roomTypes: [
          { id: 'r16', name: '设计师大床', price: 699 },
          { id: 'r17', name: '露台套房', price: 999 },
        ],
        openTime: '2024-12-01',
        status: HOTEL_STATUS.REJECTED,
        rejectReason: '资质材料不全',
        nearby: '上海、新天地、设计师、网红、无烟',
        images: [],
        createdAt: '2024-05-02T10:00:00.000Z',
        updatedAt: '2024-05-02T10:00:00.000Z',
      },

      // 北京（覆盖：亲子/高端/低价/宠物友好/泳池）
      {
        id: 'h9',
        merchantId: 'u1',
        nameZh: '北京王府井半岛酒店',
        nameEn: 'The Peninsula Beijing',
        address: '北京市东城区王府井金鱼胡同 8 号',
        starLevel: 5,
        roomTypes: [
          { id: 'r18', name: '半岛高级套间', price: 2188 },
          { id: 'r19', name: '特级豪华套间', price: 3188 },
        ],
        openTime: '2016-08-08',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '北京、王府井、故宫、豪华、亲子、免费停车、含早、健身房、无烟',
        images: [],
        createdAt: '2024-04-10T10:00:00.000Z',
        updatedAt: '2024-04-10T10:00:00.000Z',
      },
      {
        id: 'h10',
        merchantId: 'u1',
        nameZh: '如家快捷酒店(北京站店)',
        nameEn: 'Home Inn Beijing Railway Station',
        address: '北京市东城区北京站东街 1 号',
        starLevel: 2,
        roomTypes: [
          { id: 'r20', name: '标准间', price: 228 },
          { id: 'r21', name: '大床房', price: 268 },
        ],
        openTime: '2012-03-15',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '北京、北京站、近地铁、商务、无烟',
        images: [],
        createdAt: '2024-04-12T10:00:00.000Z',
        updatedAt: '2024-04-12T10:00:00.000Z',
      },
      {
        id: 'h11',
        merchantId: 'u1',
        nameZh: '北京三里屯宠物友好酒店',
        nameEn: 'Beijing Sanlitun Pet Friendly Hotel',
        address: '北京市朝阳区工体北路 66 号',
        starLevel: 3,
        roomTypes: [
          { id: 'r22', name: '宠物友好大床', price: 499 },
          { id: 'r23', name: '双床房', price: 559 },
        ],
        openTime: '2020-10-01',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '北京、三里屯、宠物友好、网红、近地铁',
        images: [],
        createdAt: '2024-06-01T10:00:00.000Z',
        updatedAt: '2024-06-01T10:00:00.000Z',
      },
      {
        id: 'h12',
        merchantId: 'u1',
        nameZh: '北京国贸泳池酒店',
        nameEn: 'Beijing Guomao Pool Hotel',
        address: '北京市朝阳区建国门外大街 1 号',
        starLevel: 4,
        roomTypes: [
          { id: 'r24', name: '高级大床', price: 799 },
          { id: 'r25', name: '行政房', price: 999 },
        ],
        openTime: '2019-05-01',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '北京、国贸、泳池、健身房、豪华、含早、免费停车',
        images: [],
        createdAt: '2024-06-02T10:00:00.000Z',
        updatedAt: '2024-06-02T10:00:00.000Z',
      },

      // 深圳（覆盖：商务/科技园/低价/无烟）
      {
        id: 'h13',
        merchantId: 'u1',
        nameZh: '深圳湾万豪酒店',
        nameEn: 'Shenzhen Bay Marriott',
        address: '广东省深圳市南山区后海滨路 88 号',
        starLevel: 5,
        roomTypes: [
          { id: 'r26', name: '湾景大床', price: 1299 },
          { id: 'r27', name: '行政套房', price: 2199 },
        ],
        openTime: '2017-09-01',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '深圳、深圳湾、豪华、含早、泳池、健身房、免费停车、无烟',
        images: [],
        createdAt: '2024-06-10T10:00:00.000Z',
        updatedAt: '2024-06-10T10:00:00.000Z',
      },
      {
        id: 'h14',
        merchantId: 'u1',
        nameZh: '深圳科技园商务酒店',
        nameEn: 'Shenzhen High-Tech Park Business Hotel',
        address: '广东省深圳市南山区科技园科苑路 100 号',
        starLevel: 4,
        roomTypes: [
          { id: 'r28', name: '商务大床', price: 599 },
          { id: 'r29', name: '商务双床', price: 659 },
        ],
        openTime: '2021-04-01',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '深圳、科技园、商务、近地铁、免费停车、无烟',
        images: [],
        createdAt: '2024-06-11T10:00:00.000Z',
        updatedAt: '2024-06-11T10:00:00.000Z',
      },
      {
        id: 'h15',
        merchantId: 'u1',
        nameZh: '深圳地铁口快捷酒店',
        nameEn: 'Shenzhen Metro Budget Hotel',
        address: '广东省深圳市福田区福华路 200 号',
        starLevel: 2,
        roomTypes: [
          { id: 'r30', name: '特惠大床', price: 159 },
          { id: 'r31', name: '标准间', price: 199 },
        ],
        openTime: '2014-02-01',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '深圳、近地铁、商务、无烟',
        images: [],
        createdAt: '2024-06-12T10:00:00.000Z',
        updatedAt: '2024-06-12T10:00:00.000Z',
      },

      // 广州（覆盖：含早/亲子/低价/设计师）
      {
        id: 'h16',
        merchantId: 'u1',
        nameZh: '广州塔景观酒店',
        nameEn: 'Guangzhou Canton Tower View Hotel',
        address: '广东省广州市海珠区阅江西路 222 号',
        starLevel: 4,
        roomTypes: [
          { id: 'r32', name: '塔景大床', price: 699 },
          { id: 'r33', name: '亲子套房', price: 899 },
        ],
        openTime: '2019-11-01',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '广州、广州塔、亲子、含早、免费停车、网红、无烟',
        images: [],
        createdAt: '2024-06-20T10:00:00.000Z',
        updatedAt: '2024-06-20T10:00:00.000Z',
      },
      {
        id: 'h17',
        merchantId: 'u1',
        nameZh: '广州设计师酒店(上下线测试)',
        nameEn: 'Guangzhou Designer Hotel (Offline)',
        address: '广东省广州市越秀区北京路 9 号',
        starLevel: 4,
        roomTypes: [
          { id: 'r34', name: '设计师大床', price: 559 },
          { id: 'r35', name: '露台房', price: 759 },
        ],
        openTime: '2022-06-01',
        status: HOTEL_STATUS.OFFLINE,
        rejectReason: null,
        nearby: '广州、北京路、设计师、网红、无烟',
        images: [],
        createdAt: '2024-06-21T10:00:00.000Z',
        updatedAt: '2024-06-21T10:00:00.000Z',
      },
      {
        id: 'h18',
        merchantId: 'u1',
        nameZh: '广州火车站快捷酒店',
        nameEn: 'Guangzhou Railway Station Budget Hotel',
        address: '广东省广州市越秀区环市西路 1 号',
        starLevel: 1,
        roomTypes: [
          { id: 'r36', name: '单人间', price: 129 },
          { id: 'r37', name: '双人间', price: 169 },
        ],
        openTime: '2010-01-01',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '广州、火车站、近地铁、商务',
        images: [],
        createdAt: '2024-06-22T10:00:00.000Z',
        updatedAt: '2024-06-22T10:00:00.000Z',
      },

      // 成都（覆盖：温泉/度假/低价/审核中）
      {
        id: 'h19',
        merchantId: 'u1',
        nameZh: '成都青城山温泉度假酒店',
        nameEn: 'Chengdu Qingcheng Mountain Hot Spring Resort',
        address: '四川省成都市都江堰市青城山路 88 号',
        starLevel: 5,
        roomTypes: [
          { id: 'r38', name: '温泉别墅', price: 1688 },
          { id: 'r39', name: '山景套房', price: 1288 },
        ],
        openTime: '2020-12-01',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '成都、青城山、温泉、度假、亲子、含早、免费停车',
        images: [],
        createdAt: '2024-07-01T10:00:00.000Z',
        updatedAt: '2024-07-01T10:00:00.000Z',
      },
      {
        id: 'h20',
        merchantId: 'u1',
        nameZh: '成都春熙路网红酒店',
        nameEn: 'Chengdu Chunxi Road Trendy Hotel',
        address: '四川省成都市锦江区春熙路 99 号',
        starLevel: 4,
        roomTypes: [
          { id: 'r40', name: '网红大床', price: 499 },
          { id: 'r41', name: '设计师房', price: 699 },
        ],
        openTime: '2021-08-01',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '成都、春熙路、网红、设计师、近地铁、无烟',
        images: [],
        createdAt: '2024-07-02T10:00:00.000Z',
        updatedAt: '2024-07-02T10:00:00.000Z',
      },
      {
        id: 'h21',
        merchantId: 'u1',
        nameZh: '成都地铁口快捷酒店(审核中)',
        nameEn: 'Chengdu Metro Budget (Pending)',
        address: '四川省成都市武侯区人民南路 300 号',
        starLevel: 2,
        roomTypes: [
          { id: 'r42', name: '特惠房', price: 189 },
          { id: 'r43', name: '标准房', price: 229 },
        ],
        openTime: '2025-01-01',
        status: HOTEL_STATUS.PENDING,
        rejectReason: null,
        nearby: '成都、近地铁、商务、无烟',
        images: [],
        createdAt: '2024-07-03T10:00:00.000Z',
        updatedAt: '2024-07-03T10:00:00.000Z',
      },

      // 西安（覆盖：亲子/历史景点/中高价/拒绝）
      {
        id: 'h22',
        merchantId: 'u1',
        nameZh: '西安钟楼景观酒店',
        nameEn: 'Xi’an Bell Tower View Hotel',
        address: '陕西省西安市碑林区南大街 88 号',
        starLevel: 4,
        roomTypes: [
          { id: 'r44', name: '钟楼景观房', price: 459 },
          { id: 'r45', name: '家庭房', price: 599 },
        ],
        openTime: '2019-03-01',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '西安、钟楼、回民街、亲子、含早、近地铁',
        images: [],
        createdAt: '2024-07-10T10:00:00.000Z',
        updatedAt: '2024-07-10T10:00:00.000Z',
      },
      {
        id: 'h23',
        merchantId: 'u1',
        nameZh: '西安城墙设计师酒店(未通过)',
        nameEn: 'Xi’an City Wall Designer Hotel (Rejected)',
        address: '陕西省西安市莲湖区城墙南门 6 号',
        starLevel: 4,
        roomTypes: [
          { id: 'r46', name: '设计师大床', price: 529 },
          { id: 'r47', name: '露台房', price: 729 },
        ],
        openTime: '2024-10-01',
        status: HOTEL_STATUS.REJECTED,
        rejectReason: '消防验收未通过',
        nearby: '西安、城墙、设计师、网红、无烟',
        images: [],
        createdAt: '2024-07-11T10:00:00.000Z',
        updatedAt: '2024-07-11T10:00:00.000Z',
      },
      {
        id: 'h24',
        merchantId: 'u1',
        nameZh: '西安机场商务酒店',
        nameEn: 'Xi’an Airport Business Hotel',
        address: '陕西省西安市咸阳国际机场 T3 航站楼旁',
        starLevel: 3,
        roomTypes: [
          { id: 'r48', name: '商务大床', price: 399 },
          { id: 'r49', name: '商务双床', price: 459 },
        ],
        openTime: '2018-01-01',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '西安、机场、商务、免费停车、无烟',
        images: [],
        createdAt: '2024-07-12T10:00:00.000Z',
        updatedAt: '2024-07-12T10:00:00.000Z',
      },

      // 三亚（覆盖：海景/度假/豪华/泳池）
      {
        id: 'h25',
        merchantId: 'u1',
        nameZh: '三亚亚龙湾海景度假酒店',
        nameEn: 'Sanya Yalong Bay Seaview Resort',
        address: '海南省三亚市吉阳区亚龙湾国家旅游度假区 1 号',
        starLevel: 5,
        roomTypes: [
          { id: 'r50', name: '海景大床', price: 1688 },
          { id: 'r51', name: '亲子套房', price: 2088 },
        ],
        openTime: '2015-12-01',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '三亚、亚龙湾、海景、度假、豪华、亲子、含早、泳池、免费停车',
        images: [],
        createdAt: '2024-07-20T10:00:00.000Z',
        updatedAt: '2024-07-20T10:00:00.000Z',
      },
      {
        id: 'h26',
        merchantId: 'u1',
        nameZh: '三亚大东海轻奢酒店',
        nameEn: 'Sanya Dadonghai Light Luxury Hotel',
        address: '海南省三亚市吉阳区大东海旅游区 66 号',
        starLevel: 4,
        roomTypes: [
          { id: 'r52', name: '海景房', price: 799 },
          { id: 'r53', name: '泳池房', price: 999 },
        ],
        openTime: '2019-06-01',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '三亚、大东海、海景、泳池、网红、无烟、度假',
        images: [],
        createdAt: '2024-07-21T10:00:00.000Z',
        updatedAt: '2024-07-21T10:00:00.000Z',
      },
      {
        id: 'h27',
        merchantId: 'u1',
        nameZh: '三亚市区快捷酒店',
        nameEn: 'Sanya Downtown Budget Hotel',
        address: '海南省三亚市天涯区解放路 88 号',
        starLevel: 2,
        roomTypes: [
          { id: 'r54', name: '大床房', price: 199 },
          { id: 'r55', name: '双床房', price: 239 },
        ],
        openTime: '2013-03-01',
        status: HOTEL_STATUS.APPROVED,
        rejectReason: null,
        nearby: '三亚、商务、无烟、免费停车',
        images: [],
        createdAt: '2024-07-22T10:00:00.000Z',
        updatedAt: '2024-07-22T10:00:00.000Z',
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

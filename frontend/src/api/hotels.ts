import { api } from './client'

export interface RoomType {
  id?: string
  name: string
  price: number
}

export interface Hotel {
  id: string
  merchantId: string
  nameZh: string
  nameEn: string
  address: string
  starLevel: number
  roomTypes: RoomType[]
  openTime: string
  status: string
  rejectReason?: string | null
  nearby?: string
  images?: string[]
  createdAt: string
  updatedAt: string
}

export interface HotelListParams {
  manage?: 1
  keyword?: string
  starLevel?: number | string
  page?: number
  pageSize?: number
}

export interface HotelListRes {
  list: Hotel[]
  total: number
  page: number
  pageSize: number
}

export function fetchHotelList(params: HotelListParams = {}) {
  const q = new URLSearchParams()
  if (params.manage !== undefined) q.set('manage', String(params.manage))
  if (params.keyword) q.set('keyword', params.keyword)
  if (params.starLevel !== undefined && params.starLevel !== '') q.set('starLevel', String(params.starLevel))
  if (params.page !== undefined) q.set('page', String(params.page))
  if (params.pageSize !== undefined) q.set('pageSize', String(params.pageSize))
  const query = q.toString()
  return api.get<HotelListRes>(`/hotels${query ? `?${query}` : ''}`)
}

export function fetchHotelDetail(id: string) {
  return api.get<Hotel>(`/hotels/${id}`)
}

export interface HotelFormValues {
  nameZh: string
  nameEn: string
  address: string
  starLevel: number
  roomTypes: { name: string; price: number }[]
  openTime: string
  nearby?: string
}

export function createHotel(body: HotelFormValues) {
  return api.post<Hotel>('/hotels', {
    nameZh: body.nameZh,
    nameEn: body.nameEn || body.nameZh,
    address: body.address,
    starLevel: body.starLevel,
    roomTypes: body.roomTypes.map((r) => ({ name: r.name, price: r.price })),
    openTime: body.openTime,
    nearby: body.nearby || '',
  })
}

export function updateHotel(id: string, body: HotelFormValues) {
  return api.put<Hotel>(`/hotels/${id}`, {
    nameZh: body.nameZh,
    nameEn: body.nameEn || body.nameZh,
    address: body.address,
    starLevel: body.starLevel,
    roomTypes: body.roomTypes.map((r) => ({ name: r.name, price: r.price })),
    openTime: body.openTime,
    nearby: body.nearby || '',
  })
}

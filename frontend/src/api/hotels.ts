import { api } from './client'
import type {
  Hotel,
  RoomType,
  HotelListParams,
  HotelListRes,
  HotelFormValues,
} from '@/types/hotel'

export type { Hotel, RoomType, HotelListParams, HotelListRes, HotelFormValues }

export function fetchHotelList(params: HotelListParams = {}) {
  const q = new URLSearchParams()
  if (params.manage !== undefined) q.set('manage', String(params.manage))
  if (params.keyword) q.set('keyword', params.keyword)
  if (params.starLevel !== undefined && params.starLevel !== '') q.set('starLevel', String(params.starLevel))
  if (params.city) q.set('city', params.city)
  if (params.tags) q.set('tags', params.tags)
  if (params.minPrice !== undefined) q.set('minPrice', String(params.minPrice))
  if (params.maxPrice !== undefined) q.set('maxPrice', String(params.maxPrice))
  if (params.checkIn) q.set('checkIn', params.checkIn)
  if (params.checkOut) q.set('checkOut', params.checkOut)
  if (params.page !== undefined) q.set('page', String(params.page))
  if (params.pageSize !== undefined) q.set('pageSize', String(params.pageSize))
  const query = q.toString()
  return api.get<HotelListRes>(`/hotels${query ? `?${query}` : ''}`)
}

export function fetchHotelDetail(id: string) {
  return api.get<Hotel>(`/hotels/${id}`)
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

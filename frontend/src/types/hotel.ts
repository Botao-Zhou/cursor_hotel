/**
 * 酒店与房型：前后端交互统一类型
 */

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
  pricing?: {
    checkIn?: string | null
    checkOut?: string | null
    multiplier?: number
  }
  createdAt: string
  updatedAt: string
}

export interface HotelListParams {
  manage?: 1
  keyword?: string
  starLevel?: number | string
  city?: string
  tags?: string
  minPrice?: number
  maxPrice?: number
  checkIn?: string
  checkOut?: string
  page?: number
  pageSize?: number
}

export interface HotelListRes {
  list: Hotel[]
  total: number
  page: number
  pageSize: number
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

export interface AdminHotelListParams {
  status?: string
  keyword?: string
  page?: number
  pageSize?: number
}

import { api } from './client'
import type { Hotel } from './hotels'

export interface AdminHotelListParams {
  status?: string
  keyword?: string
  page?: number
  pageSize?: number
}

export interface HotelListRes {
  list: Hotel[]
  total: number
  page: number
  pageSize: number
}

export function fetchAdminHotelList(params: AdminHotelListParams = {}) {
  const q = new URLSearchParams()
  if (params.status) q.set('status', params.status)
  if (params.keyword) q.set('keyword', params.keyword)
  if (params.page !== undefined) q.set('page', String(params.page))
  if (params.pageSize !== undefined) q.set('pageSize', String(params.pageSize))
  const query = q.toString()
  return api.get<HotelListRes>(`/admin/hotels${query ? `?${query}` : ''}`)
}

export function approveHotel(id: string) {
  return api.post<Hotel>(`/admin/hotels/${id}/approve`)
}

export function rejectHotel(id: string, reason: string) {
  return api.post<Hotel>(`/admin/hotels/${id}/reject`, { reason })
}

export function offlineHotel(id: string) {
  return api.post<Hotel>(`/admin/hotels/${id}/offline`)
}

export function restoreHotel(id: string) {
  return api.post<Hotel>(`/admin/hotels/${id}/restore`)
}

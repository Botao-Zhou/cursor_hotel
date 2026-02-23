import { useState, useEffect } from 'react'
import { Modal, Descriptions, Input, Button, Space, message } from 'antd'
import type { Hotel } from '@/api/hotels'
import { approveHotel, rejectHotel } from '@/api/admin'

interface ReviewAuditModalProps {
  open: boolean
  hotel: Hotel | null
  onClose: () => void
  onSuccess: () => void
}

export default function ReviewAuditModal({
  open,
  hotel,
  onClose,
  onSuccess,
}: ReviewAuditModalProps) {
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) setRejectReason('')
  }, [open])

  const handleApprove = async () => {
    if (!hotel) return
    setLoading(true)
    try {
      const res = await approveHotel(hotel.id)
      if (res.code !== 0) throw new Error(res.message)
      message.success('已通过并发布')
      onSuccess()
      onClose()
    } catch (e) {
      message.error(e instanceof Error ? e.message : '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!hotel) return
    const reason = rejectReason.trim()
    if (!reason) {
      message.warning('请填写不通过原因')
      return
    }
    setLoading(true)
    try {
      const res = await rejectHotel(hotel.id, reason)
      if (res.code !== 0) throw new Error(res.message)
      message.success('已驳回')
      onSuccess()
      onClose()
    } catch (e) {
      message.error(e instanceof Error ? e.message : '操作失败')
    } finally {
      setLoading(false)
    }
  }

  if (!hotel) return null

  const roomTypes = [...(hotel.roomTypes || [])].sort((a, b) => (a.price || 0) - (b.price || 0))

  return (
    <Modal
      title="酒店审核"
      open={open}
      onCancel={onClose}
      width={560}
      footer={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <span style={{ color: '#999', fontSize: 12 }}>驳回时请务必填写不通过原因</span>
          <Space>
            <Button onClick={onClose} disabled={loading}>取消</Button>
            <Button danger onClick={handleReject} loading={loading}>驳回</Button>
            <Button type="primary" onClick={handleApprove} loading={loading}>通过</Button>
          </Space>
        </Space>
      }
      destroyOnClose
    >
      <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="酒店名称（中文）">{hotel.nameZh}</Descriptions.Item>
        <Descriptions.Item label="酒店名称（英文）">{hotel.nameEn || '-'}</Descriptions.Item>
        <Descriptions.Item label="地址">{hotel.address}</Descriptions.Item>
        <Descriptions.Item label="星级">{hotel.starLevel} 星</Descriptions.Item>
        <Descriptions.Item label="开业时间">{hotel.openTime}</Descriptions.Item>
        <Descriptions.Item label="房型与价格">
          {roomTypes.length
            ? roomTypes.map((r) => `${r.name} ¥${r.price}`).join('、')
            : '-'}
        </Descriptions.Item>
        {hotel.nearby ? (
          <Descriptions.Item label="附近景点/交通">{hotel.nearby}</Descriptions.Item>
        ) : null}
        {hotel.rejectReason ? (
          <Descriptions.Item label="当前驳回原因">
            <span style={{ color: '#ff4d4f' }}>{hotel.rejectReason}</span>
          </Descriptions.Item>
        ) : null}
      </Descriptions>
      <div style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 6, color: 'rgba(0,0,0,0.65)' }}>不通过原因（驳回时必填）</div>
        <Input.TextArea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="请填写驳回原因，将反馈给商户"
          rows={3}
          maxLength={500}
          showCount
        />
      </div>
    </Modal>
  )
}

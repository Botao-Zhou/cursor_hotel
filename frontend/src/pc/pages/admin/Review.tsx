import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Table,
  Space,
  Tag,
  message,
  Popconfirm,
} from 'antd'
import { SearchOutlined, AuditOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { fetchAdminHotelList, offlineHotel, restoreHotel } from '@/api/admin'
import type { Hotel } from '@/api/hotels'
import ReviewAuditModal from './ReviewAuditModal'
import '@/styles/pc-admin-review.css'

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '审核中' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '未通过' },
  { value: 'offline', label: '已下线' },
]

const STATUS_MAP: Record<string, { text: string; color: string }> = {
  pending: { text: '审核中', color: 'orange' },
  approved: { text: '已通过', color: 'green' },
  rejected: { text: '未通过', color: 'red' },
  offline: { text: '已下线', color: 'default' },
}

export default function AdminReview() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<Hotel[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [auditModalOpen, setAuditModalOpen] = useState(false)
  const [auditHotel, setAuditHotel] = useState<Hotel | null>(null)

  const loadList = useCallback(
    async (overrides?: { page?: number }) => {
      setLoading(true)
      try {
        const keyword = form.getFieldValue('keyword')
        const status = form.getFieldValue('status')
        const res = await fetchAdminHotelList({
          page: overrides?.page ?? page,
          pageSize,
          keyword: keyword?.trim() || undefined,
          status: status === '' ? undefined : status,
        })
        if (res.code === 0 && res.data) {
          setList(res.data.list)
          setTotal(res.data.total)
        }
      } catch (e) {
        message.error(e instanceof Error ? e.message : '加载失败')
      } finally {
        setLoading(false)
      }
    },
    [page, pageSize, form]
  )

  useEffect(() => {
    loadList()
  }, [loadList])

  const onSearch = () => {
    setPage(1)
    loadList({ page: 1 })
  }

  const openAudit = (record: Hotel) => {
    setAuditHotel(record)
    setAuditModalOpen(true)
  }

  const handleOffline = async (record: Hotel) => {
    try {
      const res = await offlineHotel(record.id)
      if (res.code !== 0) throw new Error(res.message)
      message.success('已下线')
      loadList()
    } catch (e) {
      message.error(e instanceof Error ? e.message : '操作失败')
    }
  }

  const handleRestore = async (record: Hotel) => {
    try {
      const res = await restoreHotel(record.id)
      if (res.code !== 0) throw new Error(res.message)
      message.success('已恢复上线')
      loadList()
    } catch (e) {
      message.error(e instanceof Error ? e.message : '操作失败')
    }
  }

  const getMinPrice = (hotel: Hotel) => {
    const rooms = hotel.roomTypes || []
    if (rooms.length === 0) return '-'
    const min = Math.min(...rooms.map((r) => r.price || 0))
    return min > 0 ? `¥${min}` : '-'
  }

  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'nameZh',
      key: 'nameZh',
      ellipsis: true,
      render: (_: string, record: Hotel) => (
        <div>
          <div className="table-hotel-name">{record.nameZh}</div>
          {record.nameEn && (
            <div className="table-hotel-name-en">{record.nameEn}</div>
          )}
        </div>
      ),
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      width: 200,
    },
    {
      title: '星级',
      dataIndex: 'starLevel',
      key: 'starLevel',
      width: 72,
      render: (v: number) => `${v}星`,
    },
    {
      title: '底价',
      key: 'minPrice',
      width: 88,
      render: (_: unknown, record: Hotel) => getMinPrice(record),
    },
    {
      title: '开业时间',
      dataIndex: 'openTime',
      key: 'openTime',
      width: 108,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 96,
      render: (status: string, record: Hotel) => {
        const cfg = STATUS_MAP[status] || { text: status, color: 'default' }
        return (
          <Tag color={cfg.color}>
            {cfg.text}
            {record.rejectReason && status === 'rejected' && (
              <span title={record.rejectReason}>（有原因）</span>
            )}
          </Tag>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: unknown, record: Hotel) => (
        <Space wrap>
          {(record.status === 'pending' || record.status === 'rejected') && (
            <Button
              type="link"
              size="small"
              icon={<AuditOutlined />}
              onClick={() => openAudit(record)}
            >
              审核
            </Button>
          )}
          {record.status === 'approved' && (
            <Popconfirm
              title="确定下线该酒店？"
              description="下线后用户端将不可见，可随时恢复上线。"
              onConfirm={() => handleOffline(record)}
              okText="确定下线"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<StopOutlined />}>
                下线
              </Button>
            </Popconfirm>
          )}
          {record.status === 'offline' && (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleRestore(record)}
            >
              恢复上线
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="pc-admin-review">
      <Card className="pc-admin-review-card" bordered={false}>
        <Form
          form={form}
          layout="inline"
          className="pc-admin-review-search"
          onFinish={onSearch}
        >
          <Form.Item name="keyword" style={{ width: 220 }}>
            <Input
              placeholder="酒店名称/地址"
              allowClear
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            />
          </Form.Item>
          <Form.Item name="status" initialValue="" style={{ width: 140 }}>
            <Select options={STATUS_OPTIONS} placeholder="状态" allowClear />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button onClick={() => form.resetFields()}>重置</Button>
            </Space>
          </Form.Item>
        </Form>

        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={list}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps || 10)
            },
          }}
          scroll={{ x: 900 }}
          className="pc-admin-review-table"
        />
      </Card>

      <ReviewAuditModal
        open={auditModalOpen}
        hotel={auditHotel}
        onClose={() => {
          setAuditModalOpen(false)
          setAuditHotel(null)
        }}
        onSuccess={loadList}
      />
    </div>
  )
}

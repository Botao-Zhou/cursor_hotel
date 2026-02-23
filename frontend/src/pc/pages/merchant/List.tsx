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
} from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons'
import { fetchHotelList, type Hotel } from '@/api/hotels'
import { HOTEL_STATUS, getHotelStatusConfig } from '@/constants/hotelStatus'
import { formatPriceFromHotel } from '@/utils/price'
import HotelFormDrawer from './HotelFormDrawer'
import '@/styles/pc-merchant-list.css'

const STAR_OPTIONS = [
  { value: '', label: '全部星级' },
  { value: 1, label: '一星' },
  { value: 2, label: '二星' },
  { value: 3, label: '三星' },
  { value: 4, label: '四星' },
  { value: 5, label: '五星' },
]

export default function MerchantList() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<Hotel[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)

  const loadList = useCallback(
    async (overrides?: { page?: number; pageSize?: number }) => {
      setLoading(true)
      try {
        const keyword = form.getFieldValue('keyword')
        const starLevel = form.getFieldValue('starLevel')
        const res = await fetchHotelList({
          manage: 1,
          page: overrides?.page ?? page,
          pageSize: overrides?.pageSize ?? pageSize,
          keyword: keyword?.trim() || undefined,
          starLevel: starLevel === '' ? undefined : starLevel,
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

  const openAdd = () => {
    setEditingHotel(null)
    setDrawerOpen(true)
  }

  const openEdit = (record: Hotel) => {
    setEditingHotel(record)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingHotel(null)
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
      title: '星级',
      dataIndex: 'starLevel',
      key: 'starLevel',
      width: 88,
      render: (v: number) => `${v}星`,
    },
    {
      title: '底价',
      key: 'minPrice',
      width: 100,
      render: (_: unknown, record: Hotel) => formatPriceFromHotel(record),
    },
    {
      title: '开业时间',
      dataIndex: 'openTime',
      key: 'openTime',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: Hotel) => {
        const cfg = getHotelStatusConfig(status, true)
        return (
          <Tag color={cfg.color}>
            {cfg.text}
            {record.rejectReason && status === HOTEL_STATUS.REJECTED && (
              <span title={record.rejectReason}>（有原因）</span>
            )}
          </Tag>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: Hotel) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => openEdit(record)}
        >
          编辑
        </Button>
      ),
    },
  ]

  return (
    <div className="pc-merchant-list">
      <Card className="pc-merchant-card" bordered={false}>
        <Form
          form={form}
          layout="inline"
          className="pc-merchant-search"
          onFinish={onSearch}
        >
          <Form.Item name="keyword" style={{ width: 220 }}>
            <Input
              placeholder="酒店名/地址"
              allowClear
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            />
          </Form.Item>
          <Form.Item name="starLevel" initialValue="" style={{ width: 140 }}>
            <Select options={STAR_OPTIONS} placeholder="星级" allowClear />
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

        <div className="pc-merchant-toolbar">
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
            新增酒店
          </Button>
        </div>

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
          scroll={{ x: 800 }}
          className="pc-merchant-table"
        />
      </Card>

      <HotelFormDrawer
        open={drawerOpen}
        editingHotel={editingHotel}
        onClose={closeDrawer}
        onSuccess={loadList}
      />
    </div>
  )
}

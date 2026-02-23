import { useEffect } from 'react'
import { Drawer, Form, Input, InputNumber, Select, Button, Space, message } from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import type { Hotel } from '@/api/hotels'
import {
  type HotelFormValues,
  createHotel,
  updateHotel,
} from '@/api/hotels'

const STAR_OPTIONS = [
  { value: 1, label: '一星' },
  { value: 2, label: '二星' },
  { value: 3, label: '三星' },
  { value: 4, label: '四星' },
  { value: 5, label: '五星' },
]

interface HotelFormDrawerProps {
  open: boolean
  editingHotel: Hotel | null
  onClose: () => void
  onSuccess: () => void
}

export default function HotelFormDrawer({
  open,
  editingHotel,
  onClose,
  onSuccess,
}: HotelFormDrawerProps) {
  const [form] = Form.useForm<HotelFormValues>()
  const isEdit = !!editingHotel

  useEffect(() => {
    if (open) {
      if (editingHotel) {
        form.setFieldsValue({
          nameZh: editingHotel.nameZh,
          nameEn: editingHotel.nameEn || '',
          address: editingHotel.address,
          starLevel: editingHotel.starLevel,
          openTime: editingHotel.openTime,
          nearby: editingHotel.nearby || '',
          roomTypes:
            editingHotel.roomTypes?.length > 0
              ? editingHotel.roomTypes.map((r) => ({ name: r.name, price: r.price }))
              : [{ name: '', price: 0 }],
        })
      } else {
        form.resetFields()
        form.setFieldsValue({
          starLevel: 3,
          roomTypes: [{ name: '', price: 0 }],
        })
      }
    }
  }, [open, editingHotel, form])

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const roomTypes = (values.roomTypes || []).filter((r: { name: string; price: number }) => r.name?.trim())
    if (roomTypes.length === 0) {
      form.setFields([{ name: ['roomTypes'], errors: ['至少添加一个房型'] }])
      return
    }
    const payload: HotelFormValues = {
      ...values,
      roomTypes: roomTypes.map((r) => ({ name: r.name.trim(), price: Number(r.price) || 0 })),
    }

    try {
      if (isEdit) {
        const res = await updateHotel(editingHotel!.id, payload)
        if (res.code !== 0) throw new Error(res.message)
        message.success('更新成功')
      } else {
        const res = await createHotel(payload)
        if (res.code !== 0) throw new Error(res.message)
        message.success('创建成功')
      }
      onSuccess()
      onClose()
    } catch (e) {
      message.error(e instanceof Error ? e.message : '操作失败')
    }
  }

  return (
    <Drawer
      title={isEdit ? '编辑酒店' : '新增酒店'}
      width={520}
      open={open}
      onClose={onClose}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleSubmit}>
            保存
          </Button>
        </Space>
      }
      styles={{ body: { paddingBottom: 80 } }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ starLevel: 3, roomTypes: [{ name: '', price: 0 }] }}
      >
        <Form.Item
          name="nameZh"
          label="酒店名（中文）"
          rules={[{ required: true, message: '请输入酒店中文名' }]}
        >
          <Input placeholder="如：易宿精选·西湖店" />
        </Form.Item>
        <Form.Item name="nameEn" label="酒店名（英文）">
          <Input placeholder="如：Yisu Select West Lake" />
        </Form.Item>
        <Form.Item
          name="address"
          label="酒店地址"
          rules={[{ required: true, message: '请输入酒店地址' }]}
        >
          <Input placeholder="省市区 + 街道门牌" />
        </Form.Item>
        <Form.Item
          name="starLevel"
          label="酒店星级"
          rules={[{ required: true, message: '请选择星级' }]}
        >
          <Select options={STAR_OPTIONS} placeholder="请选择" />
        </Form.Item>
        <Form.Item
          name="openTime"
          label="开业时间"
          rules={[{ required: true, message: '请选择开业时间' }]}
        >
          <Input type="date" placeholder="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item label="房型与价格" required>
          <Form.List
            name="roomTypes"
            rules={[
              {
                validator: (_, value) => {
                  const list = (value || []).filter(
                    (r: { name?: string }) => r && String(r.name || '').trim()
                  )
                  if (list.length === 0) return Promise.reject(new Error('至少添加一个房型'))
                  return Promise.resolve()
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Space
                    key={key}
                    align="baseline"
                    style={{ display: 'flex', marginBottom: 12 }}
                  >
                    <Form.Item
                      {...rest}
                      name={[name, 'name']}
                      rules={[{ required: true, message: '房型名' }]}
                      style={{ width: 160 }}
                    >
                      <Input placeholder="房型名" />
                    </Form.Item>
                    <Form.Item
                      {...rest}
                      name={[name, 'price']}
                      rules={[{ required: true, message: '价格' }]}
                      style={{ width: 120 }}
                    >
                      <InputNumber min={0} placeholder="价格" style={{ width: '100%' }} />
                    </Form.Item>
                    <MinusCircleOutlined
                      onClick={() => (fields.length > 1 ? remove(name) : null)}
                      style={{
                        color: fields.length > 1 ? '#ff4d4f' : '#d9d9d9',
                        fontSize: 18,
                        cursor: fields.length > 1 ? 'pointer' : 'not-allowed',
                      }}
                    />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加房型
                  </Button>
                </Form.Item>
                <Form.ErrorList errors={errors} />
              </>
            )}
          </Form.List>
        </Form.Item>

        <Form.Item name="nearby" label="附近热门景点、交通及商场（选填）">
          <Input.TextArea
            rows={3}
            placeholder="如：西湖景区、地铁站、商场等，便于用户参考"
          />
        </Form.Item>
      </Form>
    </Drawer>
  )
}

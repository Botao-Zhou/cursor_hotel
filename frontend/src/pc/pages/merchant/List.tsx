import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

export default function MerchantList() {
  return (
    <div style={{ padding: 24 }}>
      <h1>我的酒店</h1>
      <p style={{ color: '#666', marginBottom: 16 }}>商户端 · 酒店信息录入/编辑（此处后续接列表与编辑）</p>
      <Button type="primary" icon={<PlusOutlined />}>
        新增酒店
      </Button>
    </div>
  )
}

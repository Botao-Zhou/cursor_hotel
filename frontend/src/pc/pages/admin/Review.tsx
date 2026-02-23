import { Button } from 'antd'
import { AuditOutlined } from '@ant-design/icons'

export default function AdminReview() {
  return (
    <div style={{ padding: 24 }}>
      <h1>酒店审核</h1>
      <p style={{ color: '#666', marginBottom: 16 }}>管理员 · 审核/发布/下线（此处后续接审核列表）</p>
      <Button type="primary" icon={<AuditOutlined />}>
        审核列表
      </Button>
    </div>
  )
}

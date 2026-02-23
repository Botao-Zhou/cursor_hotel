import { useParams, useNavigate } from 'react-router-dom'
import { NavBar } from 'react-vant'

export default function Detail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div className="h5-detail-page">
      <NavBar
        title="酒店详情"
        leftArrow
        onBack={() => navigate(-1)}
      />
      <div style={{ padding: 16, color: '#646566' }}>
        酒店详情页（待实现）· ID: {id}
      </div>
    </div>
  )
}

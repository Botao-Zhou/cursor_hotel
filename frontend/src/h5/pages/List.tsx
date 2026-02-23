import { useSearchParams } from 'react-router-dom'
import { NavBar, Empty } from 'react-vant'

export default function List() {
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get('keyword') ?? ''
  const city = searchParams.get('city') ?? ''
  const checkIn = searchParams.get('checkIn') ?? ''
  const checkOut = searchParams.get('checkOut') ?? ''
  const stars = searchParams.get('stars') ?? ''
  const tags = searchParams.get('tags') ?? ''

  return (
    <div className="h5-list-page">
      <NavBar title="酒店列表" leftArrow onBack={() => window.history.back()} />
      <div style={{ padding: 16 }}>
        <Empty description="酒店列表页（待实现列表与接口对接）" />
        <pre style={{ fontSize: 12, color: '#969799', marginTop: 12 }}>
          {JSON.stringify(
            { keyword, city, checkIn, checkOut, stars, tags },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  )
}

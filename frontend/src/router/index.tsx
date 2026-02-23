import { Navigate, RouteObject } from 'react-router-dom'
import PCLayout from '@/layouts/PCLayout'
import H5Layout from '@/layouts/H5Layout'
import PCWelcome from '@/pc/pages/Welcome'
import H5Welcome from '@/h5/pages/Welcome'

export const routes: RouteObject[] = [
  { index: true, element: <Navigate to="/h5" replace /> },
  {
    path: '/pc',
    element: <PCLayout />,
    children: [
      { index: true, element: <PCWelcome /> },
      // 后续在此添加：登录、注册、酒店录入/编辑、审核列表等
    ],
  },
  {
    path: '/h5',
    element: <H5Layout />,
    children: [
      { index: true, element: <H5Welcome /> },
      // 后续在此添加：酒店列表、酒店详情等
    ],
  },
  { path: '*', element: <Navigate to="/h5" replace /> },
]

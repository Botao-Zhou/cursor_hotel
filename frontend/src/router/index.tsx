import { Navigate, RouteObject } from 'react-router-dom'
import PCLayout from '@/layouts/PCLayout'
import H5Layout from '@/layouts/H5Layout'
import H5Welcome from '@/h5/pages/Welcome'
import LoginRegister from '@/pc/pages/LoginRegister'
import MerchantList from '@/pc/pages/merchant/List'
import AdminReview from '@/pc/pages/admin/Review'

export const routes: RouteObject[] = [
  { index: true, element: <Navigate to="/h5" replace /> },
  {
    path: '/pc',
    element: <PCLayout />,
    children: [
      { index: true, element: <Navigate to="/pc/login" replace /> },
      { path: 'login', element: <LoginRegister /> },
      { path: 'merchant/list', element: <MerchantList /> },
      { path: 'admin/review', element: <AdminReview /> },
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

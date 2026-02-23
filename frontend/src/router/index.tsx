import { Navigate, Outlet, RouteObject } from 'react-router-dom'
import PCLayout from '@/layouts/PCLayout'
import H5Layout from '@/layouts/H5Layout'
import Home from '@/h5/pages/Home'
import H5List from '@/h5/pages/List'
import H5Detail from '@/h5/pages/Detail'
import LoginRegister from '@/pc/pages/LoginRegister'
import MerchantList from '@/pc/pages/merchant/List'
import AdminReview from '@/pc/pages/admin/Review'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Outlet />,
    children: [
      { index: true, element: <Navigate to="/h5" replace /> },
      {
        path: 'pc',
        element: <PCLayout />,
        children: [
          { index: true, element: <Navigate to="/pc/login" replace /> },
          { path: 'login', element: <LoginRegister /> },
          { path: 'merchant/list', element: <MerchantList /> },
          { path: 'admin/review', element: <AdminReview /> },
        ],
      },
      {
        path: 'h5',
        element: <H5Layout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'list', element: <H5List /> },
          { path: 'detail/:id', element: <H5Detail /> },
        ],
      },
      { path: '*', element: <Navigate to="/h5" replace /> },
    ],
  },
]

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Tabs, Form, Input, Select, Button, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { login as apiLogin, register as apiRegister } from '@/api/auth'
import type { UserRole } from '@/contexts/AuthContext'
import '@/styles/pc-login.css'

type TabKey = 'login' | 'register'

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'merchant', label: '商户' },
  { value: 'admin', label: '管理员' },
]

export default function LoginRegister() {
  const navigate = useNavigate()
  const { login: setAuth } = useAuth()
  const [activeTab, setActiveTab] = useState<TabKey>('login')
  const [loading, setLoading] = useState(false)
  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()

  const handleLogin = async () => {
    try {
      const values = await loginForm.validateFields()
      setLoading(true)
      const { token, user } = await apiLogin(values.username, values.password)
      setAuth(token, user)
      message.success('登录成功')
      if (user.role === 'merchant') {
        navigate('/pc/merchant/list', { replace: true })
      } else {
        navigate('/pc/admin/review', { replace: true })
      }
    } catch (e) {
      message.error(e instanceof Error ? e.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    try {
      const values = await registerForm.validateFields()
      setLoading(true)
      await apiRegister(values.username, values.password, values.role)
      message.success('注册成功，请登录')
      setActiveTab('login')
      loginForm.setFieldValue('username', values.username)
      registerForm.resetFields()
    } catch (e) {
      message.error(e instanceof Error ? e.message : '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pc-login-wrap">
      <Card className="pc-login-card" title={null}>
        <div className="pc-login-header">
          <h1 className="pc-login-title">易宿酒店</h1>
          <p className="pc-login-subtitle">管理端</p>
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as TabKey)}
          centered
          size="large"
          className="pc-login-tabs"
          items={[
            {
              key: 'login',
              label: '登录',
              children: (
                <Form
                  form={loginForm}
                  layout="vertical"
                  requiredMark={false}
                  onFinish={handleLogin}
                  className="pc-login-form"
                >
                  <Form.Item
                    name="username"
                    rules={[{ required: true, message: '请输入用户名' }]}
                  >
                    <Input
                      prefix={<UserOutlined className="pc-form-icon" />}
                      placeholder="用户名"
                      size="large"
                      autoComplete="username"
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="pc-form-icon" />}
                      placeholder="密码"
                      size="large"
                      autoComplete="current-password"
                    />
                  </Form.Item>
                  <Form.Item className="pc-login-actions">
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={loading}
                      className="pc-login-btn"
                    >
                      登录
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'register',
              label: '注册',
              children: (
                <Form
                  form={registerForm}
                  layout="vertical"
                  requiredMark={false}
                  onFinish={handleRegister}
                  className="pc-login-form"
                >
                  <Form.Item
                    name="username"
                    rules={[
                      { required: true, message: '请输入用户名' },
                      { min: 2, message: '用户名至少 2 个字符' },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="pc-form-icon" />}
                      placeholder="用户名"
                      size="large"
                      autoComplete="username"
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: '请输入密码' },
                      { min: 6, message: '密码至少 6 位' },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="pc-form-icon" />}
                      placeholder="密码（至少 6 位）"
                      size="large"
                      autoComplete="new-password"
                    />
                  </Form.Item>
                  <Form.Item
                    name="confirm"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: '请确认密码' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) return Promise.resolve()
                          return Promise.reject(new Error('两次密码不一致'))
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="pc-form-icon" />}
                      placeholder="确认密码"
                      size="large"
                      autoComplete="new-password"
                    />
                  </Form.Item>
                  <Form.Item
                    name="role"
                    label="注册身份"
                    rules={[{ required: true, message: '请选择注册身份' }]}
                  >
                    <Select
                      placeholder="请选择商户或管理员"
                      size="large"
                      options={ROLE_OPTIONS}
                    />
                  </Form.Item>
                  <Form.Item className="pc-login-actions">
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={loading}
                      className="pc-login-btn"
                    >
                      注册
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}

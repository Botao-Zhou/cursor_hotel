# 易宿酒店预订平台

> 基于 **React + Node.js** 的双端酒店预订平台，面向 C 端用户的移动端预订流程与 B 端商户/管理员的酒店信息管理一体化解决方案。

---

## 一、项目简介

**易宿酒店预订平台** 是面向智慧出行场景的全栈应用：**移动端（H5）** 提供酒店查询、列表、详情与预订入口；**PC 端** 提供商户酒店信息录入/编辑与管理员审核/发布/下线能力。前后端分离架构，统一 RESTful API，支持多角色鉴权与路由守卫，并在长列表场景下做了按需渲染优化，兼顾功能完成度与代码可维护性。

---

## 二、技术栈概览

| 端 | 技术 | 说明 |
|----|------|------|
| **前端** | React 18 | 组件化 UI，函数组件 + Hooks |
| | Vite 5 | 构建与开发服务器，快速 HMR |
| | TypeScript | 类型安全与接口约束 |
| | React Router 6 | 路由与鉴权（/pc、/h5 双端分离） |
| | Ant Design 5 | PC 端管理后台 UI（表单、表格、抽屉、弹窗等） |
| | React Vant 3 | 移动端 H5 UI（日历、轮播、下拉刷新、列表加载等） |
| **后端** | Node.js (≥18) | 运行环境 |
| | Express 4 | HTTP 服务与路由 |
| | 本地 JSON 持久化 | 通过 `backend/src/db/data.json` 落盘，重启服务后数据保留 |

---

## 三、核心功能清单

### 移动端（C 端用户）

| 功能 | 状态 |
|------|------|
| 酒店查询页（首页）：Banner、地点/关键字/入住日期/星级/快捷标签、查询跳转列表 | ✅ |
| 入住日期：Vant Calendar 区间选择，展示共几晚 | ✅ |
| 酒店列表页：URL 参数解析、顶部筛选头、星级/价格筛选 | ✅ |
| 酒店列表：卡片展示封面、名称、评分、地址、底价、快捷标签 | ✅ |
| 列表分页加载（加载更多） | ✅ |
| 长列表渲染优化（IntersectionObserver 视口内按需渲染） | ✅ |
| 酒店详情页：顶部返回栏、大图 Swipe 轮播、基础信息、日历+间夜、房型按价格排序 | ✅ |
| 详情页底部操作栏：客服/收藏、立即预订 | ✅ |

### PC 端（B 端商户 / 管理员）

| 功能 | 状态 |
|------|------|
| 登录 / 注册：卡片式 Tab、注册时身份选择（商户/管理员）、登录按账号自动识别角色 | ✅ |
| 登录态持久化（localStorage）与路由跳转（商户→/pc/merchant/list，管理员→/pc/admin/review） | ✅ |
| 商户-酒店列表：查询区、新增酒店、表格展示名称/星级/底价/开业时间/状态 | ✅ |
| 商户-酒店表单：Drawer 内酒店名(中英)、地址、星级、开业时间、**动态增删房型**、附近景点（选填） | ✅ |
| 表单校验与保存后列表实时刷新 | ✅ |
| 管理员-审核列表：按状态/关键词筛选、表格展示全部酒店 | ✅ |
| 管理员-审核弹窗：酒店详情展示、通过/驳回（驳回必填原因） | ✅ |
| 管理员-下线与恢复上线（非删除，可恢复） | ✅ |

---

## 四、项目亮点（技术难点与创新）

以下为实现过程中重点攻克的技术点，对应大作业在**技术复杂度、代码质量、项目创新性**等方面的评分要求。

### 1. 长列表渲染优化（对应「对于长列表是否有渲染优化处理」）

- **策略**：在酒店列表页引入 **IntersectionObserver**，仅当卡片进入或接近视口（含 200px 预加载）时才渲染完整酒店卡片，否则渲染固定高度占位节点。
- **效果**：在数百条数据时仍只保留可见区域附近的 DOM 与重绘，避免一次性渲染大量复杂卡片导致的卡顿。
- **实现位置**：`frontend/src/h5/components/HotelCardWithOptimization.tsx`、`HotelCardPlaceholder.tsx`，并在列表页使用该包装组件，代码内附带清晰注释说明优化目的与可扩展方案（如固定高度容器下可替换为 react-window VariableSizeList）。

### 2. 多角色鉴权与路由守卫

- **设计**：账户分为**商户**与**管理员**，注册时选择身份，登录时由后端按账号返回角色；前端根据角色跳转不同首页。
- **实现**：`AuthContext` 管理 token/user，持久化至 localStorage；**PCAuthGuard** 包裹 PC 布局，实现：未登录访问受保护页→重定向登录；已登录访问登录页→按角色重定向；访问非本角色路径→重定向至本角色首页。保证 B 端路由与权限一致。

### 3. 动态房型表单与组件解耦

- **难点**：酒店表单需支持**动态增删多条房型**（房型名 + 价格），且必填校验、提交结构需与后端一致。
- **实现**：使用 Ant Design **Form.List** 管理 `roomTypes`，每项可增删；将整块表单抽离为独立组件 **HotelFormDrawer**，与列表页解耦，列表页只负责打开抽屉、传入编辑数据与刷新回调，保证主列表代码简洁、表单逻辑集中可维护。

### 4. 前后端统一响应与接口规范

- **后端**：所有接口统一返回 `{ code, message, data }`，便于前端统一处理成功/失败与错误提示。
- **前端**：封装 `api` 客户端（baseURL、Authorization 注入、JSON 解析），并按模块拆分 `auth`、`hotels`、`admin` 等接口，类型与接口一一对应，利于联调与后续扩展。

### 5. 双端 UI 与路由分离

- **PC**：Ant Design + `/pc/*` 路由（登录、商户列表、管理员审核），布局与鉴权独立。
- **H5**：React Vant + `/h5/*` 路由（首页、列表、详情），移动端适配与触控体验单独优化。  
同一仓库内前后端分离 + 前端双端分离，结构清晰，便于协作与评分展示。

---

## 五、快速启动指南

### 环境要求

- **Node.js** ≥ 18.0.0  
- **npm** 或 yarn

### 安装依赖

在项目根目录执行（推荐一键安装前后端依赖）：

```bash
npm run install:all
```

或分别安装：

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 启动服务

| 命令 | 说明 |
|------|------|
| `npm run dev` | 同时启动前端与后端（需已安装根目录依赖） |
| `npm run dev:3001` | 同时启动前端与后端，后端固定使用 3001 端口 |
| `npm run dev:frontend` | 仅启动前端开发服务器 |
| `npm run dev:backend` | 仅启动后端 API 服务 |

- **前端**：默认运行在 **http://localhost:5174**（可在 `frontend/vite.config.ts` 中修改 `server.port`）。
- **后端**：默认运行在 **http://localhost:3000**。

### 环境变量（推荐）

- 后端：复制 `backend/.env.example` 为 `backend/.env`，可配置 `PORT`、`PASSWORD_SALT`
- 前端：复制 `frontend/.env.example` 为 `frontend/.env`，可配置 `VITE_DEV_PORT`
- 前端代理会按以下优先级自动决定后端地址：
  1. `VITE_API_TARGET`（完整 URL）
  2. `VITE_BACKEND_PORT`
  3. `../backend/.env` 中的 `PORT`
  4. 默认 `http://localhost:3000`

### 代理规则

前端开发环境下，Vite 会将 **以 `/api` 开头的请求** 代理到后端服务地址（由环境变量自动解析），因此前端代码中请求 `/api/xxx` 即可访问后端，无需配置跨域。

- 移动端入口：浏览器访问 **http://localhost:5174/h5**
- PC 管理端入口：**http://localhost:5174/pc**（默认跳转登录页）

### 预置测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 商户 | merchant1 | 123456 |
| 管理员 | admin1 | 123456 |

---

## 六、目录结构说明

```
cursor_hotel/
├── package.json                 # 根脚本：install:all、dev、build
├── README.md
├── frontend/                    # 前端（React + Vite + TypeScript）
│   ├── package.json
│   ├── vite.config.ts           # 端口 5174，/api → localhost:3000
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/                 # 接口封装：client、auth、hotels、admin
│       ├── contexts/            # 全局状态：AuthContext
│       ├── router/              # 路由表：/pc、/h5 及子路由
│       ├── layouts/             # PCLayout、H5Layout
│       ├── pc/                   # PC 端页面与组件
│       │   ├── pages/           # 登录注册、商户列表、管理员审核
│       │   └── components/      # PCAuthGuard、HotelFormDrawer 等
│       ├── h5/                   # 移动端页面与组件
│       │   ├── pages/            # Home、List、Detail
│       │   └── components/       # HotelCard、HotelCardWithOptimization 等
│       └── styles/              # 全局及页面级 CSS
└── backend/                     # 后端（Node.js + Express）
    ├── package.json
    └── src/
        ├── index.js             # 入口，挂载路由与 CORS
        ├── utils/               # response 统一返回
        ├── store/               # 本地 JSON store：users、hotels、tokenStore
        ├── db/                  # data.json（持久化数据文件）
        ├── middleware/          # 鉴权：requireAuth、requireAdmin、requireMerchant
        └── routes/              # auth、hotels、admin
```

---

## 七、附录：题目与评分参考

本项目对应「易宿酒店预订平台」课程/大作业要求，覆盖：

- **功能完成度**：酒店查询页、列表页、详情页、登录注册、酒店录入/编辑、审核/发布/下线等全部要求项。
- **技术复杂度**：数据结构与接口设计、流畅的交互体验、**长列表渲染优化**（见第四节亮点 1）。
- **代码质量**：前后端与双端目录分离、统一响应与 API 封装、表单与鉴权组件抽离复用。
- **项目创新性**：IntersectionObserver 按需渲染、多角色路由守卫、动态房型表单解耦等可体现技术深度的实现。

如需扩展为生产级应用，可将后端 store 替换为数据库（如 MySQL/MongoDB），并为前端增加环境变量与构建部署配置。

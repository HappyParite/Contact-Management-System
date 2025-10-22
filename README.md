```text
concacts_backend/
├─ node_modules/
├─ src/
│  ├─ controller/
│  │  └─ contactsController.js     # 联系人控制逻辑（CRUD）
│  ├─ db/
│  │  └─ connection.js             # MySQL 数据库连接（mysql2/promise）
│  ├─ middleware/
│  │  └─ auth.js                   # 登录验证中间件（JWT认证）
│  └─ routes/
│     ├─ auth.js                   # 用户注册、登录接口
│     └─ contacts.js               # 联系人接口（受 auth 保护）
│
├─ .env.example                    # 环境变量模板
├─ concacts.html                   # 前端界面（静态管理页）
├─ package.json
├─ package-lock.json
└─ server.js                       # 后端入口文件

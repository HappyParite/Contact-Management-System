
import "dotenv/config";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

import authRouter from "./src/routes/auth.js";
import contactsRouter from "./src/routes/contacts.js";
import { authRequired } from "./src/middleware/auth.js";

const app = express();
app.use(cors());
app.use(express.json());

// 健康检查（前端“关于系统”会调用）
app.get("/api/health", (_req, res) => res.json({ status: "ok", db: true }));

// 先挂无需鉴权的登录/注册
app.use("/api/auth", authRouter);

// 受保护资源：联系人
app.use("/api/contacts", authRequired, contactsRouter);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/connection.js";

const router = express.Router();
const { JWT_SECRET, TOKEN_EXPIRES = "7d" } = process.env;
const norm = s => String(s || "").trim();
const signToken = (u) => jwt.sign({ id: u.id, username: u.username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

// 注册
router.post("/register", async (req, res) => {
    try {
        const username = norm(req.body?.username);
        const password = norm(req.body?.password);
        if (!username || !password) return res.status(400).json({ error: "缺少用户名或密码" });

        const [exist] = await db.query("SELECT id FROM users WHERE username=?", [username]);
        if (exist.length) return res.status(409).json({ error: "用户名已存在" });

        const hash = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO users (username, password_hash) VALUES (?,?)", [username, hash]);
        res.json({ message: "注册成功" });
    } catch (e) {
        console.error("[auth/register]", e);
        res.status(500).json({ error: "服务器内部错误" });
    }
});

// 登录
router.post("/login", async (req, res) => {
    try {
        const username = norm(req.body?.username);
        const password = norm(req.body?.password);

        const [rows] = await db.query("SELECT id,username,password_hash FROM users WHERE username=?", [username]);
        const user = rows[0];
        if (!user) return res.status(401).json({ error: "用户名或密码错误" });

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return res.status(401).json({ error: "用户名或密码错误" });

        const token = signToken(user);
        res.json({ token, user: { id: user.id, username: user.username } });
    } catch (e) {
        console.error("[auth/login]", e);
        res.status(500).json({ error: "服务器内部错误" });
    }
});

// 验证 token（前端登录后可调用一次，避免闪回）
router.get("/me", (req, res) => {
    try {
        const header = req.headers.authorization || "";
        const token = header.startsWith("Bearer ") ? header.slice(7) : "";
        if (!token) return res.status(401).json({ error: "未授权" });
        const p = jwt.verify(token, JWT_SECRET);
        res.json({ id: p.id, username: p.username });
    } catch {
        res.status(401).json({ error: "令牌无效或已过期" });
    }
});

export default router;

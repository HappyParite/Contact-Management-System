import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return res.status(401).json({ error: "未授权：缺少令牌" });
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: payload.id, username: payload.username };
        next();
    } catch {
        return res.status(401).json({ error: "令牌无效或已过期" });
    }
}

import { db } from "../db/connection.js";

// 规范手机号（去空格/短横线）
const normPhone = (p = "") => String(p).trim().replace(/[\s-]+/g, "");
const validate = ({ name, phone }) => {
    if (!name || !String(name).trim()) return "名称不能为空";
    if (!phone || !String(phone).trim()) return "手机号不能为空";
    return null;
};

// 列表（当前登录用户）
export async function getAll(req, res) {
    try {
        const uid = req.user?.id;
        const [rows] = await db.query(
            "SELECT id,name,phone,email,note,created_at,updated_at FROM contacts WHERE user_id=? ORDER BY name COLLATE utf8mb4_zh_0900_as_cs ASC, id ASC",
            [uid]
        );
        res.json(rows);
    } catch (e) {
        console.error("[contacts/getAll]", e);
        res.status(500).json({ error: "服务器内部错误" });
    }
}

// 新增
export async function addOne(req, res) {
    try {
        const uid = req.user?.id;
        const { name, phone, email, note } = req.body || {};
        const payload = { name: String(name || "").trim(), phone: normPhone(phone), email: email || null, note: note || null };

        const bad = validate(payload);
        if (bad) return res.status(400).json({ error: bad });

        await db.query(
            "INSERT INTO contacts (name,phone,email,note,user_id) VALUES (?,?,?,?,?)",
            [payload.name, payload.phone, payload.email, payload.note, uid]
        );
        res.json({ message: "添加成功" });
    } catch (e) {
        if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "该手机号已在你的联系人中存在" });
        console.error("[contacts/addOne]", e);
        res.status(500).json({ error: "服务器内部错误" });
    }
}

// 更新
export async function updateOne(req, res) {
    try {
        const uid = req.user?.id;
        const id = Number(req.params.id);
        const { name, phone, email, note } = req.body || {};
        const payload = { name: String(name || "").trim(), phone: normPhone(phone), email: email || null, note: note || null };

        const bad = validate(payload);
        if (bad) return res.status(400).json({ error: bad });

        const [ret] = await db.query(
            "UPDATE contacts SET name=?,phone=?,email=?,note=? WHERE id=? AND user_id=?",
            [payload.name, payload.phone, payload.email, payload.note, id, uid]
        );
        if (ret.affectedRows === 0) return res.status(404).json({ error: "未找到或无权限" });
        res.json({ message: "Updated" });
    } catch (e) {
        if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "该手机号已在你的联系人中存在" });
        console.error("[contacts/updateOne]", e);
        res.status(500).json({ error: "服务器内部错误" });
    }
}

// 删除
export async function deleteOne(req, res) {
    try {
        const uid = req.user?.id;
        const id = Number(req.params.id);
        const [ret] = await db.query("DELETE FROM contacts WHERE id=? AND user_id=?", [id, uid]);
        if (ret.affectedRows === 0) return res.status(404).json({ error: "未找到或无权限" });
        res.status(204).send();
    } catch (e) {
        console.error("[contacts/deleteOne]", e);
        res.status(500).json({ error: "服务器内部错误" });
    }
}

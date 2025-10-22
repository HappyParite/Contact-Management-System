import express from "express";
import { getAll, addOne, updateOne, deleteOne } from "../controller/contactsController.js";

const router = express.Router();
router.get("/", getAll);
router.post("/", addOne);
router.put("/:id", updateOne);
router.delete("/:id", deleteOne);

export default router;

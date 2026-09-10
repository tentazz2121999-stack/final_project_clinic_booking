import express from "express";
import aiController from "../controllers/ai.controller";
import validate from "../middleware/validate";
import { suggestSpecialtySchema } from "../schemas/ai.schema";

const router = express.Router();

// Công khai — không cần đăng nhập để dùng công cụ gợi ý
router.post("/suggest-specialty", validate(suggestSpecialtySchema), aiController.suggestSpecialty);

export default router;

import express from "express";
import specialtyController from "../controllers/specialty.controller";
import authenticate from "../middleware/authenticate";
import authorize from "../middleware/authorize";
import validate from "../middleware/validate";
import { createSpecialtySchema, updateSpecialtySchema } from "../schemas/specialty.schema";

const router = express.Router();

router.get("/", specialtyController.getAll);
router.get("/:id", specialtyController.getById);
router.post("/", authenticate, authorize("ADMIN"), validate(createSpecialtySchema), specialtyController.create);
router.put("/:id", authenticate, authorize("ADMIN"), validate(updateSpecialtySchema), specialtyController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), specialtyController.remove);

export default router;

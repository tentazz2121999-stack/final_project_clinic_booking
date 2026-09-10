import express from "express";
import userController from "../controllers/user.controller";
import authenticate from "../middleware/authenticate";
import authorize from "../middleware/authorize";
import validate from "../middleware/validate";
import { updateProfileSchema } from "../schemas/user.schema";

const router = express.Router();

router.get("/me", authenticate, userController.getMe);
router.put("/me", authenticate, validate(updateProfileSchema), userController.updateMe);
router.get("/patients", authenticate, authorize("ADMIN"), userController.searchPatients);

export default router;

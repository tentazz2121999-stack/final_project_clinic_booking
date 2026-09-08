import express from "express";
import authController from "../controllers/auth.controller";
import validate from "../middleware/validate";
import authenticate from "../middleware/authenticate";
import { registerSchema, loginSchema, refreshTokenSchema } from "../schemas/auth.schema";

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh-token", validate(refreshTokenSchema), authController.refreshToken);
router.post("/logout", authenticate, authController.logout);

export default router;

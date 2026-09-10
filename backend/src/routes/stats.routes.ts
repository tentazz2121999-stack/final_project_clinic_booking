import express from "express";
import statsController from "../controllers/stats.controller";
import authenticate from "../middleware/authenticate";
import authorize from "../middleware/authorize";

const router = express.Router();

router.get("/overview", authenticate, authorize("ADMIN"), statsController.overview);

export default router;

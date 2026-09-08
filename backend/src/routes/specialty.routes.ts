import express from "express";
import specialtyController from "../controllers/specialty.controller";

const router = express.Router();

router.get("/", specialtyController.getAll);

export default router;

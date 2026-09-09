import express from "express";
import doctorController from "../controllers/doctor.controller";

const router = express.Router();

router.get("/", doctorController.list);
router.get("/:id", doctorController.getById);
router.get("/:id/slots", doctorController.getAvailableSlots);
router.get("/:id/reviews", doctorController.getReviews);

export default router;

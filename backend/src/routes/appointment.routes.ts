import express from "express";
import appointmentController from "../controllers/appointment.controller";
import authenticate from "../middleware/authenticate";
import authorize from "../middleware/authorize";
import validate from "../middleware/validate";
import { createAppointmentSchema, reviewSchema } from "../schemas/appointment.schema";

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("PATIENT"), validate(createAppointmentSchema), appointmentController.create);
router.get("/", authorize("ADMIN"), appointmentController.listAll);
router.get("/me", authorize("PATIENT", "DOCTOR"), appointmentController.listMine);
router.patch("/:id/cancel", authorize("PATIENT", "ADMIN"), appointmentController.cancel);
router.patch("/:id/complete", authorize("DOCTOR", "ADMIN"), appointmentController.complete);
router.post("/:id/review", authorize("PATIENT"), validate(reviewSchema), appointmentController.createReview);

export default router;

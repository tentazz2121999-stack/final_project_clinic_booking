import express from "express";
import appointmentController from "../controllers/appointment.controller";
import authenticate from "../middleware/authenticate";
import authorize from "../middleware/authorize";
import validate from "../middleware/validate";
import { createAppointmentSchema } from "../schemas/appointment.schema";

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("PATIENT"), validate(createAppointmentSchema), appointmentController.create);
router.get("/me", authorize("PATIENT"), appointmentController.listMine);
router.patch("/:id/cancel", authorize("PATIENT"), appointmentController.cancel);

export default router;

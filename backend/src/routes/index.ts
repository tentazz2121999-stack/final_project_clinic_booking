import express from "express";

import authRoutes from "./auth.routes";
import specialtyRoutes from "./specialty.routes";
import doctorRoutes from "./doctor.routes";
import appointmentRoutes from "./appointment.routes";
import userRoutes from "./user.routes";
import statsRoutes from "./stats.routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/specialties", specialtyRoutes);
router.use("/doctors", doctorRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/users", userRoutes);
router.use("/stats", statsRoutes);

export default router;

const express = require("express");

const authRoutes = require("./auth.routes");
const specialtyRoutes = require("./specialty.routes");
const doctorRoutes = require("./doctor.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/specialties", specialtyRoutes);
router.use("/doctors", doctorRoutes);

module.exports = router;

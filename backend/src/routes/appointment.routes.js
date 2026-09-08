const express = require("express");
const appointmentController = require("../controllers/appointment.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const { createAppointmentSchema } = require("../schemas/appointment.schema");

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("PATIENT"), validate(createAppointmentSchema), appointmentController.create);

module.exports = router;

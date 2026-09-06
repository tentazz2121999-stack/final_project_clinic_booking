const express = require("express");
const doctorController = require("../controllers/doctor.controller");

const router = express.Router();

router.get("/", doctorController.list);
router.get("/:id", doctorController.getById);

module.exports = router;

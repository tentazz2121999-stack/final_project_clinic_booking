const express = require("express");
const specialtyController = require("../controllers/specialty.controller");

const router = express.Router();

router.get("/", specialtyController.getAll);

module.exports = router;

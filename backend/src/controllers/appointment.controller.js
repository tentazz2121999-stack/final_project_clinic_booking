const asyncHandler = require("../utils/asyncHandler");
const appointmentService = require("../services/appointment.service");

const create = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.create(req.user.id, req.body);
  res.status(201).json({ success: true, data: appointment });
});

module.exports = { create };

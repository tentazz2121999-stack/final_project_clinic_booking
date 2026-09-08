const asyncHandler = require("../utils/asyncHandler");
const doctorService = require("../services/doctor.service");
const ApiError = require("../utils/apiError");

const list = asyncHandler(async (req, res) => {
  const result = await doctorService.list(req.query);
  res.json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getById(Number(req.params.id));
  res.json({ success: true, data: doctor });
});

const getAvailableSlots = asyncHandler(async (req, res) => {
  const doctorId = Number(req.params.id);
  const { date } = req.query;
  if (!date) throw ApiError.badRequest("Vui lòng cung cấp ?date=YYYY-MM-DD");
  const result = await doctorService.getAvailableSlots(doctorId, date);
  res.json({ success: true, data: result });
});

module.exports = { list, getById, getAvailableSlots };

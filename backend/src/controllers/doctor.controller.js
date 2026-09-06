const asyncHandler = require("../utils/asyncHandler");
const doctorService = require("../services/doctor.service");

const list = asyncHandler(async (req, res) => {
  const result = await doctorService.list(req.query);
  res.json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getById(Number(req.params.id));
  res.json({ success: true, data: doctor });
});

module.exports = { list, getById };

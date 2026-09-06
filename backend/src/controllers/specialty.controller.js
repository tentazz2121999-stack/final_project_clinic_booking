const asyncHandler = require("../utils/asyncHandler");
const specialtyService = require("../services/specialty.service");

const getAll = asyncHandler(async (req, res) => {
  const specialties = await specialtyService.getAll();
  res.json({ success: true, data: specialties });
});

module.exports = { getAll };

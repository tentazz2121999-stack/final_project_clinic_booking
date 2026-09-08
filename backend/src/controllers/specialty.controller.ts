import { asyncHandler } from "../utils/asyncHandler";
import specialtyService from "../services/specialty.service";

const getAll = asyncHandler(async (req, res) => {
  const specialties = await specialtyService.getAll();
  res.json({ success: true, data: specialties });
});

export default { getAll };

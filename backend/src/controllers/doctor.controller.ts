import { asyncHandler } from "../utils/asyncHandler";
import doctorService from "../services/doctor.service";
import { ApiError } from "../utils/apiError";

const list = asyncHandler(async (req, res) => {
  const result = await doctorService.list(req.query as any);
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
  const result = await doctorService.getAvailableSlots(doctorId, date as string);
  res.json({ success: true, data: result });
});

export default { list, getById, getAvailableSlots };

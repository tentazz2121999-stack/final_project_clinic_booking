import { Request } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import doctorService from "../services/doctor.service";
import reviewService from "../services/review.service";
import { ApiError } from "../utils/apiError";

async function assertDoctorOwnerOrAdmin(req: Request, doctorId: number) {
  if (req.user!.role === "ADMIN") return;
  if (req.user!.role === "DOCTOR") {
    const doctor = await doctorService.getByUserId(req.user!.id);
    if (doctor.id === doctorId) return;
  }
  throw ApiError.forbidden("Bạn không có quyền thao tác trên lịch của bác sĩ này");
}

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

const getReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.listByDoctor(Number(req.params.id));
  res.json({ success: true, data: reviews });
});

const getMyProfile = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getByUserId(req.user!.id);
  res.json({ success: true, data: doctor });
});

const create = asyncHandler(async (req, res) => {
  const doctor = await doctorService.create(req.body);
  res.status(201).json({ success: true, data: doctor });
});

const update = asyncHandler(async (req, res) => {
  const doctor = await doctorService.update(Number(req.params.id), req.body);
  res.json({ success: true, data: doctor });
});

const remove = asyncHandler(async (req, res) => {
  await doctorService.remove(Number(req.params.id));
  res.json({ success: true, message: "Đã xóa bác sĩ" });
});

const addAvailability = asyncHandler(async (req, res) => {
  const doctorId = Number(req.params.id);
  await assertDoctorOwnerOrAdmin(req, doctorId);
  const availability = await doctorService.addAvailability(doctorId, req.body);
  res.status(201).json({ success: true, data: availability });
});

const removeAvailability = asyncHandler(async (req, res) => {
  const doctorId = Number(req.params.id);
  await assertDoctorOwnerOrAdmin(req, doctorId);
  await doctorService.removeAvailability(doctorId, Number(req.params.availabilityId));
  res.json({ success: true, message: "Đã xóa khung giờ làm việc" });
});

const addTimeBlock = asyncHandler(async (req, res) => {
  const doctorId = Number(req.params.id);
  await assertDoctorOwnerOrAdmin(req, doctorId);
  const block = await doctorService.addTimeBlock(doctorId, req.body);
  res.status(201).json({ success: true, data: block });
});

const removeTimeBlock = asyncHandler(async (req, res) => {
  const doctorId = Number(req.params.id);
  await assertDoctorOwnerOrAdmin(req, doctorId);
  await doctorService.removeTimeBlock(doctorId, Number(req.params.blockId));
  res.json({ success: true, message: "Đã xóa lịch chặn" });
});

const listTimeBlocks = asyncHandler(async (req, res) => {
  const blocks = await doctorService.listTimeBlocks(Number(req.params.id));
  res.json({ success: true, data: blocks });
});

export default {
  list,
  getById,
  getAvailableSlots,
  getReviews,
  getMyProfile,
  create,
  update,
  remove,
  addAvailability,
  removeAvailability,
  addTimeBlock,
  removeTimeBlock,
  listTimeBlocks,
};

import { asyncHandler } from "../utils/asyncHandler";
import appointmentService from "../services/appointment.service";
import reviewService from "../services/review.service";
import doctorService from "../services/doctor.service";
import { ApiError } from "../utils/apiError";

const create = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.create(req.user!, req.body);
  res.status(201).json({ success: true, data: appointment });
});

const listMine = asyncHandler(async (req, res) => {
  if (req.user!.role === "DOCTOR") {
    const doctor = await doctorService.getByUserId(req.user!.id);
    const items = await appointmentService.listMineAsDoctor(doctor.id, req.query as any);
    return res.json({ success: true, data: items });
  }
  if (req.user!.role === "PATIENT") {
    const result = await appointmentService.listMineAsPatient(req.user!.id, req.query as any);
    return res.json({ success: true, ...result });
  }
  throw ApiError.forbidden("Admin vui lòng dùng endpoint khác");
});

const cancel = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.cancel(Number(req.params.id), req.user!);
  res.json({ success: true, data: appointment });
});

const listAll = asyncHandler(async (req, res) => {
  const result = await appointmentService.listAll(req.query as any);
  res.json({ success: true, ...result });
});

const complete = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.complete(Number(req.params.id), req.user!);
  res.json({ success: true, data: appointment });
});

const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(Number(req.params.id), req.user!.id, req.body);
  res.status(201).json({ success: true, data: review });
});

export default { create, listMine, listAll, cancel, complete, createReview };

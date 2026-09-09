import { asyncHandler } from "../utils/asyncHandler";
import appointmentService from "../services/appointment.service";
import reviewService from "../services/review.service";

const create = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.create(req.user!.id, req.body);
  res.status(201).json({ success: true, data: appointment });
});

const listMine = asyncHandler(async (req, res) => {
  const result = await appointmentService.listMineAsPatient(req.user!.id, req.query as any);
  res.json({ success: true, ...result });
});

const cancel = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.cancel(Number(req.params.id), req.user!.id);
  res.json({ success: true, data: appointment });
});

const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(Number(req.params.id), req.user!.id, req.body);
  res.status(201).json({ success: true, data: review });
});

export default { create, listMine, cancel, createReview };

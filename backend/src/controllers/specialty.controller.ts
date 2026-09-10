import { asyncHandler } from "../utils/asyncHandler";
import specialtyService from "../services/specialty.service";

const getAll = asyncHandler(async (req, res) => {
  const specialties = await specialtyService.getAll();
  res.json({ success: true, data: specialties });
});

const getById = asyncHandler(async (req, res) => {
  const specialty = await specialtyService.getById(Number(req.params.id));
  res.json({ success: true, data: specialty });
});

const create = asyncHandler(async (req, res) => {
  const specialty = await specialtyService.create(req.body);
  res.status(201).json({ success: true, data: specialty });
});

const update = asyncHandler(async (req, res) => {
  const specialty = await specialtyService.update(Number(req.params.id), req.body);
  res.json({ success: true, data: specialty });
});

const remove = asyncHandler(async (req, res) => {
  await specialtyService.remove(Number(req.params.id));
  res.json({ success: true, message: "Đã xóa chuyên khoa" });
});

export default { getAll, getById, create, update, remove };

import prisma from "../config/prisma";
import { ApiError } from "../utils/apiError";

interface SpecialtyInput {
  name?: string;
  description?: string | null;
}

async function getAll() {
  return prisma.specialty.findMany({ orderBy: { name: "asc" } });
}

async function getById(id: number) {
  const specialty = await prisma.specialty.findUnique({ where: { id } });
  if (!specialty) throw ApiError.notFound("Không tìm thấy chuyên khoa");
  return specialty;
}

async function create(data: SpecialtyInput) {
  const existing = await prisma.specialty.findUnique({ where: { name: data.name } });
  if (existing) throw ApiError.conflict("Chuyên khoa đã tồn tại");
  return prisma.specialty.create({ data: { name: data.name!, description: data.description } });
}

async function update(id: number, data: SpecialtyInput) {
  await getById(id);
  return prisma.specialty.update({ where: { id }, data });
}

async function remove(id: number) {
  await getById(id);
  const doctorCount = await prisma.doctorProfile.count({ where: { specialtyId: id } });
  if (doctorCount > 0) {
    throw ApiError.conflict("Không thể xóa chuyên khoa đang có bác sĩ liên kết");
  }
  return prisma.specialty.delete({ where: { id } });
}

export default { getAll, getById, create, update, remove };

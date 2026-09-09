import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { buildPagination, buildMeta } from "../utils/pagination";
import { computeAvailableSlots, toMinutes } from "../utils/slotCalculator";

const doctorInclude = {
  user: { select: { id: true, fullName: true, phone: true } },
  specialty: true,
};

interface ListQuery {
  page?: string;
  limit?: string;
  specialtyId?: string;
}

async function list(query: ListQuery) {
  const { page, limit, skip } = buildPagination(query);
  const where: Prisma.DoctorProfileWhereInput = {};
  if (query.specialtyId) where.specialtyId = Number(query.specialtyId);

  const [items, total] = await Promise.all([
    prisma.doctorProfile.findMany({ where, include: doctorInclude, skip, take: limit }),
    prisma.doctorProfile.count({ where }),
  ]);

  return { items, meta: buildMeta({ page, limit, total }) };
}

async function getById(id: number) {
  const doctor = await prisma.doctorProfile.findUnique({ where: { id }, include: doctorInclude });
  if (!doctor) throw ApiError.notFound("Không tìm thấy bác sĩ");
  return doctor;
}

async function getAvailableSlots(doctorId: number, dateStr: string) {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorId },
    include: { availabilities: true },
  });
  if (!doctor) throw ApiError.notFound("Không tìm thấy bác sĩ");

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) throw ApiError.badRequest("Ngày không hợp lệ");

  const dayOfWeek = date.getDay();
  const availabilities = doctor.availabilities.filter((a) => a.dayOfWeek === dayOfWeek);
  if (availabilities.length === 0) return { date: dateStr, slots: [] };

  const startOfDay = new Date(dateStr);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);

  // Ngày đã qua hoàn toàn (trước hôm nay) -> không còn slot nào để đặt, khỏi cần truy vấn thêm.
  const now = new Date();
  if (endOfDay < now) return { date: dateStr, slots: [] };

  const [blocks, bookedAppointments] = await Promise.all([
    prisma.doctorTimeBlock.findMany({
      where: { doctorId, date: { gte: startOfDay, lte: endOfDay } },
    }),
    prisma.appointment.findMany({
      where: {
        doctorId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: "CANCELLED" },
      },
    }),
  ]);

  let slots = computeAvailableSlots({
    availabilities,
    blocks,
    bookedAppointments,
    slotDurationMinutes: doctor.slotDurationMinutes,
  });

  // Nếu là hôm nay, loại bỏ luôn những slot đã qua giờ hiện tại — không cho đặt lịch vào quá khứ.
  if (now >= startOfDay && now <= endOfDay) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    slots = slots.filter((s) => toMinutes(s.startTime) > nowMinutes);
  }

  return { date: dateStr, slots };
}

interface AvailabilityInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface TimeBlockInput {
  date: string;
  startTime: string;
  endTime: string;
  reason?: string | null;
}

async function getByUserId(userId: number) {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { userId },
    include: { ...doctorInclude, availabilities: true },
  });
  if (!doctor) throw ApiError.notFound("Không tìm thấy hồ sơ bác sĩ ứng với tài khoản này");
  return doctor;
}

async function addAvailability(doctorId: number, data: AvailabilityInput) {
  await getById(doctorId);
  const existing = await prisma.doctorAvailability.findUnique({
    where: {
      doctorId_dayOfWeek_startTime_endTime: {
        doctorId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    },
  });
  if (existing) throw ApiError.conflict("Khung giờ này đã tồn tại");

  return prisma.doctorAvailability.create({ data: { ...data, doctorId } });
}

async function removeAvailability(doctorId: number, availabilityId: number) {
  const availability = await prisma.doctorAvailability.findUnique({ where: { id: availabilityId } });
  if (!availability || availability.doctorId !== doctorId) {
    throw ApiError.notFound("Không tìm thấy khung giờ làm việc");
  }
  await prisma.doctorAvailability.delete({ where: { id: availabilityId } });
}

async function addTimeBlock(doctorId: number, data: TimeBlockInput) {
  await getById(doctorId);
  return prisma.doctorTimeBlock.create({
    data: { ...data, date: new Date(data.date), doctorId },
  });
}

async function removeTimeBlock(doctorId: number, blockId: number) {
  const block = await prisma.doctorTimeBlock.findUnique({ where: { id: blockId } });
  if (!block || block.doctorId !== doctorId) {
    throw ApiError.notFound("Không tìm thấy lịch chặn");
  }
  await prisma.doctorTimeBlock.delete({ where: { id: blockId } });
}

async function listTimeBlocks(doctorId: number) {
  return prisma.doctorTimeBlock.findMany({
    where: { doctorId },
    orderBy: { date: "asc" },
  });
}

export default {
  list,
  getById,
  getByUserId,
  getAvailableSlots,
  addAvailability,
  removeAvailability,
  addTimeBlock,
  removeTimeBlock,
  listTimeBlocks,
};

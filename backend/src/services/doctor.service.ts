import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { buildPagination, buildMeta } from "../utils/pagination";
import { computeAvailableSlots, rangesOverlap, toMinutes } from "../utils/slotCalculator";

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

interface CreateDoctorInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
  specialtyId: number;
  bio?: string | null;
  experienceYears?: number;
  consultationFee?: number;
  slotDurationMinutes?: number;
}

interface UpdateDoctorInput {
  fullName?: string;
  phone?: string | null;
  specialtyId?: number;
  bio?: string | null;
  experienceYears?: number;
  consultationFee?: number;
  slotDurationMinutes?: number;
}

async function create(data: CreateDoctorInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw ApiError.conflict("Email đã được sử dụng");

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        phone: data.phone || null,
        role: "DOCTOR",
      },
    });

    return tx.doctorProfile.create({
      data: {
        userId: user.id,
        specialtyId: data.specialtyId,
        bio: data.bio || null,
        experienceYears: data.experienceYears || 0,
        consultationFee: data.consultationFee || 0,
        slotDurationMinutes: data.slotDurationMinutes || 30,
      },
      include: doctorInclude,
    });
  });
}

async function update(id: number, data: UpdateDoctorInput) {
  const doctor = await getById(id);

  if (data.fullName !== undefined || data.phone !== undefined) {
    await prisma.user.update({
      where: { id: doctor.userId },
      data: {
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
      },
    });
  }

  return prisma.doctorProfile.update({
    where: { id },
    data: {
      ...(data.specialtyId !== undefined ? { specialtyId: data.specialtyId } : {}),
      ...(data.bio !== undefined ? { bio: data.bio } : {}),
      ...(data.experienceYears !== undefined ? { experienceYears: data.experienceYears } : {}),
      ...(data.consultationFee !== undefined ? { consultationFee: data.consultationFee } : {}),
      ...(data.slotDurationMinutes !== undefined ? { slotDurationMinutes: data.slotDurationMinutes } : {}),
    },
    include: doctorInclude,
  });
}

async function remove(id: number) {
  const doctor = await getById(id);
  try {
    await prisma.$transaction([
      prisma.doctorProfile.delete({ where: { id } }),
      prisma.user.delete({ where: { id: doctor.userId } }),
    ]);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      throw ApiError.conflict("Không thể xóa bác sĩ đang có lịch hẹn hoặc đánh giá trong hệ thống");
    }
    throw err;
  }
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

  const date = new Date(data.date);
  const startOfDay = new Date(data.date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(data.date);
  endOfDay.setHours(23, 59, 59, 999);

  const confirmedAppointments = await prisma.appointment.findMany({
    where: { doctorId, date: { gte: startOfDay, lte: endOfDay }, status: "CONFIRMED" },
  });

  const blockStart = toMinutes(data.startTime);
  const blockEnd = toMinutes(data.endTime);
  const conflict = confirmedAppointments.find((a) =>
    rangesOverlap(blockStart, blockEnd, toMinutes(a.startTime), toMinutes(a.endTime))
  );
  if (conflict) {
    throw ApiError.conflict(
      `Khung giờ này đang có lịch hẹn đã xác nhận (${conflict.startTime}-${conflict.endTime}), vui lòng hủy lịch hẹn đó trước khi chặn`
    );
  }

  return prisma.doctorTimeBlock.create({
    data: { ...data, date, doctorId },
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
  create,
  update,
  remove,
  getAvailableSlots,
  addAvailability,
  removeAvailability,
  addTimeBlock,
  removeTimeBlock,
  listTimeBlocks,
};

const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const { buildPagination, buildMeta } = require("../utils/pagination");
const { computeAvailableSlots } = require("../utils/slotCalculator");

const doctorInclude = {
  user: { select: { id: true, fullName: true, phone: true } },
  specialty: true,
};

async function list(query) {
  const { page, limit, skip } = buildPagination(query);
  const where = {};
  if (query.specialtyId) where.specialtyId = Number(query.specialtyId);

  const [items, total] = await Promise.all([
    prisma.doctorProfile.findMany({ where, include: doctorInclude, skip, take: limit }),
    prisma.doctorProfile.count({ where }),
  ]);

  return { items, meta: buildMeta({ page, limit, total }) };
}

async function getById(id) {
  const doctor = await prisma.doctorProfile.findUnique({ where: { id }, include: doctorInclude });
  if (!doctor) throw ApiError.notFound("Không tìm thấy bác sĩ");
  return doctor;
}

async function getAvailableSlots(doctorId, dateStr) {
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

  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: { gte: startOfDay, lte: endOfDay },
      status: { not: "CANCELLED" },
    },
  });

  const slots = computeAvailableSlots({
    availabilities,
    bookedAppointments,
    slotDurationMinutes: doctor.slotDurationMinutes,
  });

  return { date: dateStr, slots };
}

module.exports = { list, getById, getAvailableSlots };

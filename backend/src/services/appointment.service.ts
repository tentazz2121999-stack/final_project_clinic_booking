import { AppointmentStatus, Prisma } from "@prisma/client";
import prisma from "../config/prisma";
import { ApiError } from "../utils/apiError";
import env from "../config/env";
import { buildPagination, buildMeta } from "../utils/pagination";
import doctorService from "./doctor.service";
import { TokenPayload } from "../utils/jwt";

const appointmentInclude = {
  doctor: {
    include: {
      user: { select: { id: true, fullName: true, phone: true } },
      specialty: true,
    },
  },
  patient: { select: { id: true, fullName: true, phone: true, email: true } },
  review: true,
};

interface CreateAppointmentInput {
  doctorId: number;
  date: string;
  startTime: string;
  reason?: string | null;
}

interface ListQuery {
  page?: string;
  limit?: string;
  status?: string;
}

interface DoctorListQuery {
  date?: string;
  status?: string;
}

interface AdminListQuery {
  page?: string;
  limit?: string;
  status?: string;
  doctorId?: string;
  date?: string;
}

async function create(patientId: number, data: CreateAppointmentInput) {
  const doctor = await prisma.doctorProfile.findUnique({ where: { id: data.doctorId } });
  if (!doctor) throw ApiError.notFound("Không tìm thấy bác sĩ");

  const { slots } = await doctorService.getAvailableSlots(data.doctorId, data.date);
  const matchedSlot = slots.find((s) => s.startTime === data.startTime);
  if (!matchedSlot) {
    throw ApiError.conflict("Khung giờ này không còn trống, vui lòng chọn khung giờ khác");
  }

  try {
    return await prisma.appointment.create({
      data: {
        doctorId: data.doctorId,
        patientId,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: matchedSlot.endTime,
        reason: data.reason || null,
        status: "CONFIRMED",
      },
      include: appointmentInclude,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw ApiError.conflict("Khung giờ này vừa được đặt bởi người khác, vui lòng chọn khung giờ khác");
    }
    throw err;
  }
}

async function listMineAsPatient(patientId: number, query: ListQuery) {
  const { page, limit, skip } = buildPagination(query);
  const where: Prisma.AppointmentWhereInput = { patientId };
  if (query.status) where.status = query.status as AppointmentStatus;

  const [items, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: appointmentInclude,
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
      skip,
      take: limit,
    }),
    prisma.appointment.count({ where }),
  ]);

  return { items, meta: buildMeta({ page, limit, total }) };
}

async function listMineAsDoctor(doctorProfileId: number, query: DoctorListQuery) {
  const where: Prisma.AppointmentWhereInput = { doctorId: doctorProfileId };
  if (query.status) where.status = query.status as AppointmentStatus;
  if (query.date) {
    const start = new Date(query.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(query.date);
    end.setHours(23, 59, 59, 999);
    where.date = { gte: start, lte: end };
  }

  return prisma.appointment.findMany({
    where,
    include: appointmentInclude,
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
}

async function listAll(query: AdminListQuery) {
  const { page, limit, skip } = buildPagination(query);
  const where: Prisma.AppointmentWhereInput = {};
  if (query.doctorId) where.doctorId = Number(query.doctorId);
  if (query.status) where.status = query.status as AppointmentStatus;
  if (query.date) {
    const start = new Date(query.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(query.date);
    end.setHours(23, 59, 59, 999);
    where.date = { gte: start, lte: end };
  }

  const [items, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: appointmentInclude,
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
      skip,
      take: limit,
    }),
    prisma.appointment.count({ where }),
  ]);

  return { items, meta: buildMeta({ page, limit, total }) };
}

async function getById(id: number) {
  const appointment = await prisma.appointment.findUnique({ where: { id }, include: appointmentInclude });
  if (!appointment) throw ApiError.notFound("Không tìm thấy lịch hẹn");
  return appointment;
}

async function cancel(id: number, user: TokenPayload) {
  const appointment = await getById(id);

  if (user.role === "PATIENT" && appointment.patientId !== user.id) {
    throw ApiError.forbidden("Bạn không có quyền thao tác trên lịch hẹn này");
  }
  if (user.role === "DOCTOR") throw ApiError.forbidden();

  if (appointment.status !== "CONFIRMED") {
    throw ApiError.conflict("Chỉ có thể hủy lịch hẹn đang ở trạng thái đã xác nhận");
  }

  // Bệnh nhân chỉ được hủy trước tối thiểu N giờ; Admin hủy hộ (VD bệnh nhân gọi điện) thì không bị giới hạn này.
  if (user.role === "PATIENT") {
    const appointmentDateTime = new Date(appointment.date);
    const [h, m] = appointment.startTime.split(":").map(Number);
    appointmentDateTime.setHours(h, m, 0, 0);

    const hoursUntilAppointment = (appointmentDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilAppointment < env.minCancelHoursBefore) {
      throw ApiError.badRequest(
        `Chỉ có thể hủy lịch hẹn trước tối thiểu ${env.minCancelHoursBefore} giờ so với giờ khám`
      );
    }
  }

  return prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: appointmentInclude,
  });
}

async function complete(id: number, user: TokenPayload) {
  const appointment = await getById(id);
  if (user.role === "DOCTOR" && appointment.doctor.userId !== user.id) {
    throw ApiError.forbidden("Bạn không có quyền thao tác trên lịch hẹn này");
  }
  if (user.role === "PATIENT") throw ApiError.forbidden();

  if (appointment.status !== "CONFIRMED") {
    throw ApiError.conflict("Chỉ có thể đánh dấu hoàn thành cho lịch hẹn đang ở trạng thái đã xác nhận");
  }

  return prisma.appointment.update({
    where: { id },
    data: { status: "COMPLETED" },
    include: appointmentInclude,
  });
}

export default { create, listMineAsPatient, listMineAsDoctor, listAll, getById, cancel, complete };

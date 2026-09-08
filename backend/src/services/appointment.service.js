const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const doctorService = require("./doctor.service");

const appointmentInclude = {
  doctor: {
    include: {
      user: { select: { id: true, fullName: true, phone: true } },
      specialty: true,
    },
  },
  patient: { select: { id: true, fullName: true, phone: true, email: true } },
};

async function create(patientId, data) {
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
    if (err.code === "P2002") {
      throw ApiError.conflict("Khung giờ này vừa được đặt bởi người khác, vui lòng chọn khung giờ khác");
    }
    throw err;
  }
}

module.exports = { create };

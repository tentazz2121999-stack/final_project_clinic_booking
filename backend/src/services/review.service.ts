import prisma from "../config/prisma";
import { ApiError } from "../utils/apiError";

interface CreateReviewInput {
  rating: number;
  comment?: string | null;
}

async function createReview(appointmentId: number, patientId: number, data: CreateReviewInput) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { review: true },
  });

  if (!appointment) throw ApiError.notFound("Không tìm thấy lịch hẹn");
  if (appointment.patientId !== patientId) {
    throw ApiError.forbidden("Bạn chỉ có thể đánh giá lịch hẹn của chính mình");
  }
  if (appointment.status !== "COMPLETED") {
    throw ApiError.conflict("Chỉ có thể đánh giá sau khi đã hoàn thành lịch khám");
  }
  if (appointment.review) {
    throw ApiError.conflict("Lịch hẹn này đã được đánh giá");
  }

  return prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        appointmentId,
        doctorId: appointment.doctorId,
        patientId,
        rating: data.rating,
        comment: data.comment || null,
      },
    });

    const doctorReviews = await tx.review.findMany({ where: { doctorId: appointment.doctorId } });
    const avgRating = doctorReviews.reduce((sum, r) => sum + r.rating, 0) / doctorReviews.length;

    await tx.doctorProfile.update({
      where: { id: appointment.doctorId },
      data: { avgRating, reviewCount: doctorReviews.length },
    });

    return created;
  });
}

async function listByDoctor(doctorId: number) {
  return prisma.review.findMany({
    where: { doctorId },
    include: { patient: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export default { createReview, listByDoctor };

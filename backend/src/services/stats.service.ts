import prisma from "../config/prisma";

async function overview() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalDoctors, totalPatients, totalSpecialties, appointmentsToday, totalAppointments, byStatusRaw, topDoctorsRaw] =
    await Promise.all([
      prisma.doctorProfile.count(),
      prisma.user.count({ where: { role: "PATIENT" } }),
      prisma.specialty.count(),
      prisma.appointment.count({ where: { date: { gte: today, lt: tomorrow } } }),
      prisma.appointment.count(),
      prisma.appointment.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.appointment.groupBy({
        by: ["doctorId"],
        _count: { _all: true },
        orderBy: { _count: { doctorId: "desc" } },
        take: 5,
      }),
    ]);

  const doctorIds = topDoctorsRaw.map((d) => d.doctorId);
  const doctors = await prisma.doctorProfile.findMany({
    where: { id: { in: doctorIds } },
    include: { user: { select: { fullName: true } }, specialty: true },
  });

  const topDoctors = topDoctorsRaw.map((t) => {
    const doctor = doctors.find((d) => d.id === t.doctorId);
    return {
      doctorId: t.doctorId,
      appointmentCount: t._count._all,
      fullName: doctor?.user.fullName,
      specialty: doctor?.specialty.name,
    };
  });

  const byStatus = byStatusRaw.reduce<Record<string, number>>((acc, cur) => {
    acc[cur.status] = cur._count._all;
    return acc;
  }, {});

  return {
    totalDoctors,
    totalPatients,
    totalSpecialties,
    appointmentsToday,
    totalAppointments,
    appointmentsByStatus: byStatus,
    topDoctors,
  };
}

export default { overview };

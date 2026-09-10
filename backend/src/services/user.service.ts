import prisma from "../config/prisma";
import { ApiError } from "../utils/apiError";

interface UpdateProfileInput {
  fullName: string;
  phone?: string | null;
  dateOfBirth?: string | null;
}

async function getById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { doctorProfile: { include: { specialty: true } } },
  });
  if (!user) throw ApiError.notFound("Không tìm thấy người dùng");
  const { password, refreshToken, ...publicUser } = user;
  return publicUser;
}

async function updateProfile(id: number, data: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
    },
  });
  const { password, refreshToken, ...publicUser } = user;
  return publicUser;
}

async function searchPatients(search: string) {
  if (!search || search.trim().length < 2) return [];

  const patients = await prisma.user.findMany({
    where: {
      role: "PATIENT",
      OR: [
        { email: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
      ],
    },
    select: { id: true, email: true, fullName: true, phone: true },
    take: 10,
    orderBy: { fullName: "asc" },
  });

  return patients;
}

export default { getById, updateProfile, searchPatients };

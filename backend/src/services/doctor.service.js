const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const { buildPagination, buildMeta } = require("../utils/pagination");

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

module.exports = { list, getById };

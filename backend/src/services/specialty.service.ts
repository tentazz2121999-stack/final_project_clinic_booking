import prisma from "../config/prisma";

async function getAll() {
  return prisma.specialty.findMany({ orderBy: { name: "asc" } });
}

export default { getAll };

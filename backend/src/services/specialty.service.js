const prisma = require("../config/prisma");

async function getAll() {
  return prisma.specialty.findMany({ orderBy: { name: "asc" } });
}

module.exports = { getAll };

interface PaginationQuery {
  page?: string;
  limit?: string;
}

export function buildPagination(query: PaginationQuery) {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildMeta({ page, limit, total }: { page: number; limit: number; total: number }) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

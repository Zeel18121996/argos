export class PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export class PaginatedResponseDto<T> {
  data: T[]
  meta: PaginationMeta
}

/** Helper to build pagination meta */
export function buildMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}

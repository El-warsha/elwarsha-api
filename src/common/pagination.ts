export type PageQuery = {
  cursor?: string;
  limit?: number;
};

export type Page<T> = {
  items: T[];
  nextCursor: string | null;
};

export type AssignmentQuery = PageQuery & {
  labelId?: string;
};

export function resolveLimit(limit?: number, fallback = 20, max = 50): number {
  if (!limit) {
    return fallback;
  }
  return Math.min(Math.max(limit, 1), max);
}

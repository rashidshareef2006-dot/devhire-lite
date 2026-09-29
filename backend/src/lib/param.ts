import type { Request } from 'express';

/** Safely coerce req.params.id to string (Express 5 types return string | string[] | undefined) */
export function paramId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : String(id ?? '');
}
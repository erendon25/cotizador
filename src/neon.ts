import { createClient } from '@neondatabase/neon-js';

const databaseUrl: string = String(import.meta.env.VITE_NEON_DATABASE_URL ?? '').trim();

export const neonConfigured = Boolean(databaseUrl);

export const neon = databaseUrl ? createClient(databaseUrl) : null;

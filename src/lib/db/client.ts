import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { env } from '@/lib/env';
import * as schema from './schema';

if (!process.env.TURSO_DATABASE_URL || !env.TURSO_AUTH_TOKEN) { 
  throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
}

const client = createClient({
  url: env.TURSO_DATABASE_URL as string,
  authToken: env.TURSO_AUTH_TOKEN
});

export const db = drizzle(client, { schema }); 
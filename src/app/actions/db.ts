'use server';

import { createClient } from '@libsql/client';
import { env } from '@/lib/env';

export async function checkDatabaseConnection() {
  try {
    const client = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN
    });
    
    await client.execute('SELECT 1');
    return { connected: true, error: null };
  } catch (error) {
    console.error('Database connection error:', error);
    return { connected: false, error: (error as Error).message };
  }
} 
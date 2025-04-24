import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;
import * as schema from '@shared/schema';
import dotenv from 'dotenv';

dotenv.config();

// Create the pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create the drizzle instance
const db = drizzle(pool, { schema });

// Export both as named exports
export { pool, db };
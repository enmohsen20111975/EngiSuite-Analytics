/**
 * Database Service - MySQL via Prisma (primary) + sql.js SQLite (optional local caches)
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prisma client for MySQL database
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

// sql.js connections (optional — only used for local SQLite caches)
let coursesDb: any = null;
let workflowsDb: any = null;

// Database paths for optional local SQLite caches
const DB_PATHS = {
  courses: path.resolve(__dirname, '../../Databases/engmastery.db'),
  workflows: path.resolve(__dirname, '../../Databases/workflows.db'),
};

/**
 * Initialize all database connections
 */
export async function initDatabase(): Promise<void> {
  // Connect Prisma to MySQL — this is the primary database
  await prisma.$connect();
  console.log('✅ MySQL database (Prisma) connected');

  // sql.js SQLite caches are optional — failures here must NOT crash the server
  try {
    const initSqlJs = (await import('sql.js')).default;
    const SQL = await initSqlJs({
      locateFile: (file: string) => {
        const wasmPath = path.resolve(__dirname, `../../node_modules/sql.js/dist/${file}`);
        if (fs.existsSync(wasmPath)) return wasmPath;
        return path.resolve(__dirname, `../node_modules/sql.js/dist/${file}`);
      }
    });

    if (fs.existsSync(DB_PATHS.courses)) {
      coursesDb = new SQL.Database(fs.readFileSync(DB_PATHS.courses));
    } else {
      coursesDb = new SQL.Database();
    }

    if (fs.existsSync(DB_PATHS.workflows)) {
      workflowsDb = new SQL.Database(fs.readFileSync(DB_PATHS.workflows));
    } else {
      workflowsDb = new SQL.Database();
    }

    console.log('✅ sql.js SQLite caches initialized');
  } catch (error) {
    console.warn('⚠️  sql.js SQLite caches unavailable (non-fatal):', (error as Error).message);
    // Provide empty stub databases so routes that try to use them don't crash import
    coursesDb = null;
    workflowsDb = null;
  }
}

/**
 * Save databases to disk (call periodically and on shutdown)
 */
export function saveDatabases(): void {
  try {
    if (workflowsDb && fs.existsSync(path.dirname(DB_PATHS.workflows))) {
      const data = workflowsDb.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_PATHS.workflows, buffer);
    }
    if (coursesDb && fs.existsSync(path.dirname(DB_PATHS.courses))) {
      const data = coursesDb.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_PATHS.courses, buffer);
    }
  } catch (error) {
    console.error('Error saving databases:', error);
  }
}

/**
 * Disconnect all database connections
 */
export async function disconnectDatabase(): Promise<void> {
  // Save databases before closing
  saveDatabases();
  
  await prisma.$disconnect();
  coursesDb?.close();
  workflowsDb?.close();
  console.log('📊 All database connections closed');
}

/**
 * Get the Prisma client (for users/auth operations)
 */
export function getPrisma(): PrismaClient {
  return prisma;
}

/**
 * Get direct SQLite database connections
 */
export function getCoursesDb(): any {
  return coursesDb;
}

export function getWorkflowsDb(): any {
  return workflowsDb;
}

/**
 * Helper interface for statement-like behavior
 */
export interface Statement {
  run: (...params: unknown[]) => { changes: number; lastInsertRowid: number };
  get: (...params: unknown[]) => Record<string, unknown> | undefined;
  all: (...params: unknown[]) => Record<string, unknown>[];
}

/**
 * Create a statement-like wrapper for sql.js database
 */
export function prepare(db: any, sql: string): Statement {
  return {
    run(...params: unknown[]): { changes: number; lastInsertRowid: number } {
      db.run(sql, params as (string | number | null | Uint8Array)[]);
      const result = db.exec('SELECT last_insert_rowid() as id, changes() as changes');
      const lastInsertRowid = (result[0]?.values[0]?.[0] as number) || 0;
      const changes = (result[0]?.values[0]?.[1] as number) || 0;
      saveDatabases();
      return { changes, lastInsertRowid };
    },
    
    get(...params: unknown[]): Record<string, unknown> | undefined {
      const result = db.exec(sql, params as (string | number | null | Uint8Array)[]);
      if (result.length === 0 || result[0].values.length === 0) return undefined;
      
      const columns = result[0].columns;
      const row = result[0].values[0];
      
      const obj: Record<string, unknown> = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    },
    
    all(...params: unknown[]): Record<string, unknown>[] {
      const result = db.exec(sql, params as (string | number | null | Uint8Array)[]);
      if (result.length === 0) return [];
      
      const columns = result[0].columns;
      const values = result[0].values;
      
      return values.map(row => {
        const obj: Record<string, unknown> = {};
        columns.forEach((col, i) => {
          obj[col] = row[i];
        });
        return obj;
      });
    }
  };
}

/**
 * Create a prepared statement for courses database
 */
export function prepareCourses(sql: string): Statement {
  const db = getCoursesDb();
  if (!db) throw new Error('Courses database unavailable');
  return prepare(db, sql);
}

/**
 * Create a prepared statement for workflows database
 */
export function prepareWorkflows(sql: string): Statement {
  const db = getWorkflowsDb();
  if (!db) throw new Error('Workflows database unavailable');
  return prepare(db, sql);
}

/**
 * Helper function to run queries on courses database
 */
export function queryCourses<T = unknown>(sql: string, params: unknown[] = []): T[] {
  const stmt = prepareCourses(sql);
  return stmt.all(...params) as T[];
}

/**
 * Helper function to run queries on workflows database
 */
export function queryWorkflows<T = unknown>(sql: string, params: unknown[] = []): T[] {
  const stmt = prepareWorkflows(sql);
  return stmt.all(...params) as T[];
}

/**
 * Helper function to run a single query
 */
export function queryOne<T = unknown>(db: any, sql: string, params: unknown[] = []): T | undefined {
  const stmt = prepare(db, sql);
  return stmt.get(...params) as T | undefined;
}

/**
 * Helper function to run insert/update/delete
 */
export function execute(db: any, sql: string, params: unknown[] = []): { changes: number; lastInsertRowid: number } {
  const stmt = prepare(db, sql);
  return stmt.run(...params);
}

/**
 * Helper to run transactions (simplified for sql.js)
 */
export function transaction<T>(db: any, fn: () => T): T {
  db.run('BEGIN TRANSACTION');
  try {
    const result = fn();
    db.run('COMMIT');
    saveDatabases();
    return result;
  } catch (error) {
    db.run('ROLLBACK');
    throw error;
  }
}

// Export prisma for backward compatibility
export { prisma };
export default prisma;

/**
 * Multi-Database Service - Handles multiple SQLite databases
 * Uses Prisma for users database (ORM) and sql.js for courses/workflows
 * sql.js is a pure JavaScript implementation that works on shared hosting
 */

import { PrismaClient } from '@prisma/client';
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database paths - relative to project root
const DB_PATHS = {
  users: path.resolve(__dirname, '../../Databases/users.db'),
  courses: path.resolve(__dirname, '../../Databases/engmastery.db'),
  workflows: path.resolve(__dirname, '../../Databases/workflows.db'),
};

// Prisma client for users database
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// sql.js connections for courses and workflows
let SQL: initSqlJs.SqlJsStatic | null = null;
let coursesDb: SqlJsDatabase | null = null;
let workflowsDb: SqlJsDatabase | null = null;

/**
 * Initialize all database connections
 */
export async function initDatabase(): Promise<void> {
  try {
    // Initialize sql.js with explicit WASM path for production environments
    SQL = await initSqlJs({
      locateFile: (file: string) => {
        const wasmPath = path.resolve(__dirname, `../../node_modules/sql.js/dist/${file}`);
        if (fs.existsSync(wasmPath)) return wasmPath;
        return path.resolve(__dirname, `../node_modules/sql.js/dist/${file}`);
      }
    });
    console.log('✅ sql.js initialized');

    // Connect Prisma to users database
    await prisma.$connect();
    console.log(`✅ Users database (Prisma) connected: ${DB_PATHS.users}`);

    // Initialize sql.js connections for courses
    if (fs.existsSync(DB_PATHS.courses)) {
      const coursesBuffer = fs.readFileSync(DB_PATHS.courses);
      coursesDb = new SQL.Database(coursesBuffer);
      console.log(`✅ Courses database connected: ${DB_PATHS.courses}`);
    } else {
      coursesDb = new SQL.Database();
      console.log(`✅ Courses database created: ${DB_PATHS.courses}`);
    }

    // Initialize sql.js connections for workflows
    if (fs.existsSync(DB_PATHS.workflows)) {
      const workflowsBuffer = fs.readFileSync(DB_PATHS.workflows);
      workflowsDb = new SQL.Database(workflowsBuffer);
      console.log(`✅ Workflows database connected: ${DB_PATHS.workflows}`);
    } else {
      workflowsDb = new SQL.Database();
      console.log(`✅ Workflows database created: ${DB_PATHS.workflows}`);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 All databases initialized');
    }
  } catch (error) {
    console.error('❌ Failed to connect to databases:', error);
    throw error;
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
export function getCoursesDb(): SqlJsDatabase {
  if (!coursesDb) {
    throw new Error('Courses database not initialized. Call initDatabase() first.');
  }
  return coursesDb;
}

export function getWorkflowsDb(): SqlJsDatabase {
  if (!workflowsDb) {
    throw new Error('Workflows database not initialized. Call initDatabase() first.');
  }
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
export function prepare(db: SqlJsDatabase, sql: string): Statement {
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
  return prepare(getCoursesDb(), sql);
}

/**
 * Create a prepared statement for workflows database
 */
export function prepareWorkflows(sql: string): Statement {
  return prepare(getWorkflowsDb(), sql);
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
export function queryOne<T = unknown>(db: SqlJsDatabase, sql: string, params: unknown[] = []): T | undefined {
  const stmt = prepare(db, sql);
  return stmt.get(...params) as T | undefined;
}

/**
 * Helper function to run insert/update/delete
 */
export function execute(db: SqlJsDatabase, sql: string, params: unknown[] = []): { changes: number; lastInsertRowid: number } {
  const stmt = prepare(db, sql);
  return stmt.run(...params);
}

/**
 * Helper to run transactions (simplified for sql.js)
 */
export function transaction<T>(db: SqlJsDatabase, fn: () => T): T {
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

/**
 * Multi-Database Service - Handles multiple SQLite databases
 * Uses Prisma for users database (ORM) and better-sqlite3 for courses/workflows
 */

import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database paths - relative to project root
const DB_PATHS = {
  users: path.resolve(__dirname, '../../Databases/users.db'),
  courses: path.resolve(__dirname, '../../Databases/engmastery.db'), // Updated to use engmastery.db
  workflows: path.resolve(__dirname, '../../Databases/workflows.db'),
};

// Prisma client for users database
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// Better-sqlite3 connections for courses and workflows
let coursesDb: Database.Database | null = null;
let workflowsDb: Database.Database | null = null;

/**
 * Initialize all database connections
 */
export async function initDatabase(): Promise<void> {
  try {
    // Connect Prisma to users database
    await prisma.$connect();
    console.log(`✅ Users database (Prisma) connected: ${DB_PATHS.users}`);

    // Initialize better-sqlite3 connections
    coursesDb = new Database(DB_PATHS.courses, { readonly: true, fileMustExist: false });
    console.log(`✅ Courses database connected: ${DB_PATHS.courses}`);

    workflowsDb = new Database(DB_PATHS.workflows, { readonly: false, fileMustExist: false });
    console.log(`✅ Workflows database connected: ${DB_PATHS.workflows}`);

    // Enable performance optimizations
    workflowsDb.pragma('foreign_keys = ON');
    workflowsDb.pragma('journal_mode = WAL');

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 All databases initialized');
    }
  } catch (error) {
    console.error('❌ Failed to connect to databases:', error);
    throw error;
  }
}

/**
 * Disconnect all database connections
 */
export async function disconnectDatabase(): Promise<void> {
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
export function getCoursesDb(): Database.Database {
  if (!coursesDb) {
    throw new Error('Courses database not initialized. Call initDatabase() first.');
  }
  return coursesDb;
}

export function getWorkflowsDb(): Database.Database {
  if (!workflowsDb) {
    throw new Error('Workflows database not initialized. Call initDatabase() first.');
  }
  return workflowsDb;
}

/**
 * Helper function to run queries on courses database
 */
export function queryCourses<T = unknown>(sql: string, params: unknown[] = []): T[] {
  const db = getCoursesDb();
  const stmt = db.prepare(sql);
  return stmt.all(...params) as T[];
}

/**
 * Helper function to run queries on workflows database
 */
export function queryWorkflows<T = unknown>(sql: string, params: unknown[] = []): T[] {
  const db = getWorkflowsDb();
  const stmt = db.prepare(sql);
  return stmt.all(...params) as T[];
}

/**
 * Helper function to run a single query
 */
export function queryOne<T = unknown>(db: Database.Database, sql: string, params: unknown[] = []): T | undefined {
  const stmt = db.prepare(sql);
  return stmt.get(...params) as T | undefined;
}

/**
 * Helper function to run insert/update/delete
 */
export function execute(db: Database.Database, sql: string, params: unknown[] = []): Database.RunResult {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

/**
 * Helper to run transactions
 */
export function transaction<T>(db: Database.Database, fn: () => T): T {
  return db.transaction(fn)();
}

// Export prisma for backward compatibility
export { prisma };
export default prisma;

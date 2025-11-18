import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// 笔记分类相关查询
export async function getUserCategories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { categories } = await import("../drizzle/schema");
  return db.select().from(categories).where(eq(categories.userId, userId));
}

export async function createCategory(data: { userId: number; name: string; color?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { categories } = await import("../drizzle/schema");
  const result = await db.insert(categories).values(data);
  return result;
}

export async function deleteCategory(categoryId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { categories } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  await db.delete(categories).where(
    and(eq(categories.id, categoryId), eq(categories.userId, userId))
  );
}

// 笔记相关查询
export async function getUserNotes(userId: number, categoryId?: number) {
  const db = await getDb();
  if (!db) return [];
  const { notes } = await import("../drizzle/schema");
  const { and, desc } = await import("drizzle-orm");
  
  if (categoryId !== undefined) {
    return db.select().from(notes).where(
      and(eq(notes.userId, userId), eq(notes.categoryId, categoryId))
    ).orderBy(desc(notes.updatedAt));
  }
  
  return db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.updatedAt));
}

export async function getNoteById(noteId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { notes } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  const result = await db.select().from(notes).where(
    and(eq(notes.id, noteId), eq(notes.userId, userId))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createNote(data: { userId: number; categoryId?: number; title: string; content: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { notes } = await import("../drizzle/schema");
  const result = await db.insert(notes).values(data);
  return result;
}

export async function updateNote(noteId: number, userId: number, data: { title?: string; content?: string; categoryId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { notes } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  await db.update(notes).set(data).where(
    and(eq(notes.id, noteId), eq(notes.userId, userId))
  );
}

export async function deleteNote(noteId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { notes } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  await db.delete(notes).where(
    and(eq(notes.id, noteId), eq(notes.userId, userId))
  );
}

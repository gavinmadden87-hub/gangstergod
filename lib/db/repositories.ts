import { db } from "./client";
import {
  type InsertOutcomeLog,
  type InsertWeightHistory,
  type SelectOutcomeLog,
  type SelectWeightHistory,
  outcomeLogTable,
  weightHistoryTable,
} from "./schema";

async function insertOne<T>(rows: T[]): Promise<T> {
  const row = rows[0];

  if (!row) {
    throw new Error("Database insert returned no rows.");
  }

  return row;
}

export const outcomeLogRepository = {
  table: outcomeLogTable,
  async insert(values: InsertOutcomeLog): Promise<SelectOutcomeLog> {
    return insertOne(await db.insert(outcomeLogTable).values(values).returning());
  },
  async all(): Promise<SelectOutcomeLog[]> {
    return db.select().from(outcomeLogTable);
  },
  async count(): Promise<number> {
    return (await this.all()).length;
  },
  async latest(): Promise<SelectOutcomeLog | null> {
    return (await this.all()).at(-1) ?? null;
  },
};

export const weightHistoryRepository = {
  table: weightHistoryTable,
  async insert(values: InsertWeightHistory): Promise<SelectWeightHistory> {
    return insertOne(await db.insert(weightHistoryTable).values(values).returning());
  },
  async all(): Promise<SelectWeightHistory[]> {
    return db.select().from(weightHistoryTable);
  },
  async count(): Promise<number> {
    return (await this.all()).length;
  },
  async latest(): Promise<SelectWeightHistory | null> {
    return (await this.all()).at(-1) ?? null;
  },
};

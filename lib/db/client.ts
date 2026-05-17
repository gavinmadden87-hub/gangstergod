import {
  type InsertOutcomeLog,
  type InsertWeightHistory,
  type SelectOutcomeLog,
  type SelectWeightHistory,
  outcomeLogTable,
  weightHistoryTable,
} from "./schema";

type AppTable = typeof outcomeLogTable | typeof weightHistoryTable;
type InsertForTable<TTable extends AppTable> = TTable extends typeof outcomeLogTable
  ? InsertOutcomeLog
  : InsertWeightHistory;
type SelectForTable<TTable extends AppTable> = TTable extends typeof outcomeLogTable
  ? SelectOutcomeLog
  : SelectWeightHistory;

type TableStore = {
  [outcomeLogTable.name]: SelectOutcomeLog[];
  [weightHistoryTable.name]: SelectWeightHistory[];
};

const store: TableStore = {
  [outcomeLogTable.name]: [],
  [weightHistoryTable.name]: [],
};

function materializeRow<TTable extends AppTable>(
  table: TTable,
  values: InsertForTable<TTable>,
): SelectForTable<TTable> {
  if (table.name === weightHistoryTable.name) {
    return {
      ...(values as InsertWeightHistory),
      persistedRowCount: store.weight_history.length + 1,
    } as SelectForTable<TTable>;
  }

  return { ...(values as InsertOutcomeLog) } as SelectForTable<TTable>;
}

function rowsFor<TTable extends AppTable>(table: TTable): SelectForTable<TTable>[] {
  return store[table.name] as SelectForTable<TTable>[];
}

export const db = {
  insert<TTable extends AppTable>(table: TTable) {
    return {
      values(values: InsertForTable<TTable>) {
        return {
          async returning(): Promise<SelectForTable<TTable>[]> {
            const row = materializeRow(table, values);
            rowsFor(table).push(row);
            return [row];
          },
        };
      },
    };
  },
  select() {
    return {
      from<TTable extends AppTable>(table: TTable) {
        return Promise.resolve([...rowsFor(table)]);
      },
    };
  },
};

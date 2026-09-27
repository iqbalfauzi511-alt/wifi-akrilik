import { getDb } from './lib/db/index.js';

async function run() {
  const db = await getDb();
  try {
    await db.execute(`ALTER TABLE scan_logs ADD COLUMN action_type VARCHAR(32) NOT NULL DEFAULT 'page_view';`);
    console.log("Column added successfully!");
  } catch(e) {
    console.error("Error adding column (maybe it already exists or syntax error):", e.message);
  }
}
run();

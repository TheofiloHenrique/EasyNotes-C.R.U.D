import Database from "better-sqlite3";

const db = new Database('easyNotes.db')

db.prepare(`
    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL
    )
`).run();

export default db;
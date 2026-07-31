const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const DB_FILE = './database.sqlite';

async function initDb() {
  const db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS hosts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      priority INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS proxies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      host TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const proxyColumns = await db.all("PRAGMA table_info(proxies)");
  const proxyColumnNames = proxyColumns.map((column) => column.name);

  if (!proxyColumnNames.includes('host') && proxyColumnNames.length > 0) {
    await db.exec('ALTER TABLE proxies RENAME TO proxies_old');
    await db.exec(`
      CREATE TABLE proxies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const sourceColumn = proxyColumnNames.includes('server') ? 'server' : proxyColumnNames.includes('host') ? 'host' : null;
    if (sourceColumn) {
      await db.run(
        `INSERT INTO proxies (host, created_at) SELECT ${sourceColumn}, IFNULL(created_at, CURRENT_TIMESTAMP) FROM proxies_old`
      );
    }

    await db.exec('DROP TABLE proxies_old');
  }

  return db;
}

module.exports = { initDb };

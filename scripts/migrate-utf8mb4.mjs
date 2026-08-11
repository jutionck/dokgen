import { createPool } from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL wajib diisi.");
}

const escapeIdentifier = (value) => `\`${String(value).replaceAll("`", "``")}\``;
const pool = createPool(databaseUrl);
const connection = await pool.getConnection();

try {
  const [[databaseRow]] = await connection.query("SELECT DATABASE() AS database_name");
  const databaseName = databaseRow?.database_name;
  if (!databaseName) throw new Error("Nama database aktif tidak ditemukan.");

  const [tables] = await connection.query(
    "SELECT TABLE_NAME AS table_name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
  );

  await connection.query("SET FOREIGN_KEY_CHECKS = 0");
  try {
    await connection.query(
      `ALTER DATABASE ${escapeIdentifier(databaseName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );

    for (const { table_name: tableName } of tables) {
      await connection.query(
        `ALTER TABLE ${escapeIdentifier(tableName)} CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      console.log(`Converted ${tableName} to utf8mb4_unicode_ci`);
    }
  } finally {
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
  }

  console.log(`Database ${databaseName} berhasil dikonversi ke utf8mb4.`);
} finally {
  connection.release();
  await pool.end();
}

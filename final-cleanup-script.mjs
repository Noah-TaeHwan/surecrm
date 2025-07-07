import 'dotenv/config';
import postgres from 'postgres';

async function runFinalCleanup() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set in your .env file.');
    process.exit(1);
  }

  console.log('Connecting to the database...');
  const sql = postgres(connectionString);

  try {
    const nameColumn = 'migration_name';
    console.log(
      `Attempting to use column "${nameColumn}" to identify migrations.`
    );

    const result = await sql.unsafe(
      `DELETE FROM drizzle.__drizzle_migrations WHERE "${nameColumn}" = '0000_melted_morph.sql'`
    );
    console.log(
      `✅ Record deleted successfully. Rows affected: ${result.count}`
    );

    console.log('Migration history should be clean now.');
  } catch (error) {
    console.error('❌ Failed to clean up migration history:', error);
    console.log(
      'If this failed, please check the column name in the drizzle.__drizzle_migrations table in your Supabase dashboard.'
    );
  } finally {
    await sql.end();
    console.log('Database connection closed.');
  }
}

runFinalCleanup();

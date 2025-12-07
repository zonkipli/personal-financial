const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: process.env.MYSQL_HOST || 'vendory.my.id',
  user: process.env.MYSQL_USER || 'digital1_financial_app',
  password: process.env.MYSQL_PASSWORD || 'digital1_financial_app',
  database: process.env.MYSQL_DATABASE || 'digital1_financial_app',
  multipleStatements: true
};

async function runMigration() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('Connected successfully!');

    const migrationFile = path.join(__dirname, '004-add-accounts-and-multi-features.sql');
    console.log(`Reading migration file: ${migrationFile}`);

    const sql = fs.readFileSync(migrationFile, 'utf8');
    console.log('Executing migration...');

    await connection.query(sql);
    console.log('Migration executed successfully!');

  } catch (error) {
    console.error('Error running migration:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed.');
    }
  }
}

runMigration();

const mysql = require('mysql2/promise');
const { Pool } = require('pg');
require('dotenv').config();

let pool;

if (process.env.DATABASE_URL) {
  // --- PostgreSQL Connection for Render ---
  console.log('✅ Connecting to PostgreSQL database...');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  // Test the connection on startup
  pool.connect()
    .then(client => {
      console.log('✅ PostgreSQL database connected successfully!');
      client.release();
    })
    .catch(err => {
      console.error('❌ PostgreSQL database connection failed:', err.message);
    });

} else {
  // --- MySQL Connection for Local Development ---
  console.log('✅ Connecting to MySQL database...');
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  });

  // Test the connection on startup
  pool.getConnection()
    .then(connection => {
      console.log('✅ MySQL database connected successfully!');
      connection.release();
    })
    .catch(err => {
      console.error('❌ MySQL database connection failed:', err.message);
    });
}

// Handle pool errors (applies to both)
pool.on('error', (err) => {
  console.error('Database pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === '57P01') {
    console.error('Database connection was lost');
  }
});

// Since the rest of your application uses `pool` directly,
// the code remains compatible.
module.exports = pool;
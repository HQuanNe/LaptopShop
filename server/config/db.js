const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hquantech_db',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});


// Helper test connection
pool.getConnection()
  .then((conn) => {
    console.log(`[Database] Connected successfully to MySQL (${process.env.DB_NAME || 'hquantech_db'}) at ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || '3306'}`);
    conn.release();
  })
  .catch((err) => {
    console.warn(`[Database] Initial pool notice:`, err.message);
  });

module.exports = pool;

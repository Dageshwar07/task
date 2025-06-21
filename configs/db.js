const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'openfga_demo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to check database connection
async function connect() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    throw error;
  }
}

// Function to execute queries
async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  connect,
  query,
  pool
};
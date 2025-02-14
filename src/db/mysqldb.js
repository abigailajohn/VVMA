const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: process.env.CONNECTION_LIMIT || 10
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database successfully.');
    connection.release();
  } catch (err) {
    console.error('Error connecting to MySQL:', err.message);
  }
};

testConnection();

module.exports = pool;

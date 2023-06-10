const mysql = require('mysql2/promise');

module.exports = db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'iot_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

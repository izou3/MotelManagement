const mysql = require('mysql2/promise');

/**
 * Create SQL Connection Pool Object
 */
module.exports.connectSQL = (dsn) => {
  return mysql.createPool(dsn);
};

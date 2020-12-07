require('dotenv').config();

/**
 * Required for Sequelize Migrations
 */
module.exports = {
  development: {
    username: process.env.DEV_SQLUSER,
    password: process.env.DEV_SQLPASSWORD,
    database: process.env.DEV_SQLDB,
    host: process.env.DEV_HOST,
    port: process.env.DEV_SQL_PORT,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true,
    },
  },
  test: {
    username: process.env.TEST_SQLUSER,
    password: process.env.TEST_SQLPASSWORD,
    database: process.env.TEST_SQLDB,
    host: process.env.TEST_HOST,
    port: process.env.TEST_SQL_PORT,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true,
    },
  },
  production: {
    username: process.env.PROD_SQLUSER,
    password: process.env.PROD_SQLPASSWORD,
    database: process.env.PROD_SQLDB,
    host: process.env.PROD_HOST,
    port: process.env.PROD_SQL_PORT,
    sslmode: process.env.REQUIRED,
    dialect: 'mysql',
  },
};

require('dotenv').config();

module.exports = {
  development: {
    clientDomain: process.env.DEVELOPMENT_CLIENT_DOMAIN,
    sitename: 'Big Sky Lodge [DEVELOPMENT]',
    HTTP_PORT: process.env.HTTP_PORT,
    AGENDA_PORT: process.env.AGENDA_PORT,
    jwtKey: process.env.JWT_SECRET_KEY,
    database: {
      mongo: process.env.DEVELOPMENT_MONGODB_DSN,
      sql: {
        host: process.env.DEV_HOST,
        port: process.env.DEV_SQL_PORT,
        user: process.env.DEV_SQLUSER,
        password: process.env.DEV_SQLPASSWORD,
        database: process.env.DEV_SQLDB,
      },
    },
    mongoLocalReplicaSetURL: process.env.LOCAL_MONGO_REPLICASET_CONNECT,
    mongoLocalURL: process.env.LOCAL_MONGO_CONNECT,
    emailTemplatePath: process.env.DEV_EMAIL_TEMPLATE_PATH,
  },
  test: {
    clientDomain: process.env.TEST_CLIENT_DOMAIN,
    sitename: 'Big Sky Lodge [Test]',
    HTTP_PORT: process.env.HTTP_PORT,
    AGENDA_PORT: process.env.AGENDA_PORT,
    jwtKey: process.env.JWT_SECRET_KEY,
    database: {
      mongo: process.env.TEST_MONGODB_DSN,
      sql: {
        host: process.env.TEST_HOST,
        port: process.env.TEST_SQL_PORT,
        user: process.env.TEST_SQLUSER,
        password: process.env.TEST_SQLPASSWORD,
        database: process.env.TEST_SQLDB,
      },
    },
    emailTemplatePath: process.env.DEV_EMAIL_TEMPLATE_PATH,
  },
  production: {
    clientDomain: process.env.PRODUCTION_CLIENT_DOMAIN,
    sitename: 'Big Sky Lodge',
    HTTP_PORT: process.env.HTTP_PORT,
    AGENDA_PORT: process.env.AGENDA_PORT,
    jwtKey: process.env.JWT_SECRET_KEY,
    emailTemplatePath: process.env.PROD_EMAIL_TEMPLATE_PATH,
    database: {
      mongo: process.env.PRODUCTION_MONGODB_DSN,
      sql: {
        host: process.env.PROD_HOST,
        port: process.env.PROD_SQL_PORT,
        user: process.env.PROD_SQLUSER,
        password: process.env.PROD_SQLPASSWORD,
        database: process.env.PROD_SQLDB,
      },
    },
  },
};

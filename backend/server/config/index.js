require('dotenv').config();

module.exports = {
  development: {
    sitename: 'Big Sky Lodge [DEVELOPMENT]',
    HTTP_PORT: process.env.HTTP_PORT,
    AGENDA_PORT: process.env.AGENDA_PORT,
    RoomNum: process.env.ROOM_NUM,
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
  },
  test: {
    sitename: 'Big Sky Lodge [Test]',
    HTTP_PORT: process.env.HTTP_PORT,
    AGENDA_PORT: process.env.AGENDA_PORT,
    RoomNum: process.env.ROOM_NUM,
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
  },
  production: {
    sitename: 'Big Sky Lodge',
    HTTP_PORT: process.env.HTTP_PORT,
    AGENDA_PORT: process.env.AGENDA_PORT,
    RoomNum: process.env.ROOM_NUM,
    jwtKey: process.env.JWT_SECRET_KEY,
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

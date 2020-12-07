/**
 * Module dependencies.
 */
const http = require('http');
const cluster = require('cluster');
const Agenda = require('agenda');
const debug = require('debug')('motel:http');
require('regenerator-runtime/runtime'); // to allow aysnc/await syntax during webpack bundle

// Configuration Module
const config = require('../../config')[process.env.NODE_ENV || 'development'];

// Events
const EmailEvent = require('../../subscribers/EmailEvent');

// DB and Logger Libraries
const logger = require('../../lib/logger/logger');
const mongoDB = require('../../lib/db/mongo.js');
const SQLPool = require('../../lib/db/sql');

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

/**
 * Establish Mongo and SQL Pool Connection
 */
const mongoPromise = async () => mongoDB.connectMongo(config.database.mongo);
const sqlPromise = async () => SQLPool.connectSQL(config.database.sql);

Promise.all([mongoPromise(), sqlPromise()])
  .then((values) => {
    // Establish an Agenda Connection to Mongo for pushing Jobs
    // to the Queue
    const agenda = new Agenda().mongo(values[0].db, 'AgendaJobs');

    // Reservation Email Events
    EmailEvent.setMessageQueue = agenda;
    EmailEvent.once(EmailEvent.getJobName, (data) =>
      EmailEvent.addToQueue(data)
    );
    EmailEvent.on(EmailEvent.getErrorName, (error) => {
      logger.error(error);
    });

    // API Routes
    const app = require('../index')({ config, values });

    /**
     * Get port from environment and store in Express.
     */
    const port = normalizePort(config.HTTP_PORT || '3000');
    app.set('port', port);

    /**
     * Create HTTP server and listen on the provided port
     */
    const server = http.createServer(app);
    if (process.env.NODE_ENV === 'production') {
      if (cluster.isMaster) {
        // Fork http server load in production mode
        logger.info(`Master ${process.pid} is running`);
        cluster.fork();
        cluster.fork();

        cluster.on('exit', () => {
          logger.info(`Worker ${process.pid} died`);
          cluster.fork();
        });
      } else {
        server.listen(port);
      }
    } else {
      // Run Single Process http server in development mode
      server.listen(port);
    }

    server.on('listening', () => {
      const addr = server.address();
      const bind =
        typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
      debug(`Listening on ${bind}`);
      logger.info(`HTTP Server Listening on Port:${port}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        logger.error(error);
        throw error;
      }

      const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          debug(`${bind} requires elevated privileges`);
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          debug(`${bind} is already in use`);
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          debug(error);
          logger.error(error);
          process.exit(1);
        // throw error;
      }
    });
  })
  .catch((err) => {
    debug(err);
    logger.error(err);
    process.exit(1);
  });

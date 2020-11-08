/**
 * AgendaJS Background Processing
 *
 * The scheduled task setup and startup script
 */

/**
 * Module dependencies
 */
const path = require('path');
const Agenda = require('agenda');
const Agendash = require('agendash');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('regenerator-runtime/runtime'); // For Bundling async/await syntax

/**
 * Configuration
 */
const config = require('../server/config')[
  process.env.NODE_ENV || 'development'
];

/**
 * DB and Logger Libraries
 */
const logger = require('../server/lib/logger');
const mongoDB = require('../server/lib/mongo.js');

// Authentication Service
const { loginRequired } = require('../server/services/Staff');

const app = express();
(async function run() {
  mongoDB.connectMongo(config.database.mongo).then(async (connection) => {
    // Instantiate an Agenda Instance that will Process the Job Processor
    // Every Minute locking only 2 Job at a Time to Run
    const agenda = new Agenda()
      .processEvery('10 minutes')
      .lockLimit(1)
      .mongo(connection.db, 'AgendaJobs');

    /**
     * Import Jobs
     */
    require('../server/jobs/DailyReport')(agenda, config);
    require('../server/jobs/Reservation')(agenda);
    require('../server/jobs/EmailJobs')(agenda, config);

    // Using Helmet Doesn't Render Agendash Properly
    // app.use(helmet());

    // Pug Setup
    app.set('view engine', 'pug');
    app.set('views', path.join(__dirname, '../server/views'));

    // Cookie Setup for Auth
    app.use(cookieParser());

    /**
     * Set the User if token in defined in the cookie.
     */
    app.use((req, res, next) => {
      const { token } = req.cookies;

      try {
        if (!token) throw new Error('Undefined Token');
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
      } catch (err) {
        req.user = undefined;
        const error = new Error('Unauthorized User');
        error.status = 401;
        next(error);
      } finally {
        next();
      }
    });

    app.use('/dash', loginRequired, Agendash(agenda));

    await agenda.start();

    // Send Repeating Jobs Into The Job Processor
    await agenda.every(
      '10 00 * * *',
      'GenerateDailyReport',
      `Generates New Daily Report`,
      {
        timezone: 'America/Denver',
      }
    );

    await agenda.every(
      '30 00 * * *',
      'UpdateCurrent',
      `Moved Incoming Reservations`,
      {
        timezone: 'America/Denver',
      }
    );

    // 404 error handler
    app.use((req, res, next) => {
      const error = new Error('Undefined Route');
      error.status = 404;
      next(error);
    });

    // Error Handler
    app.use((err, req, res, next) => {
      const status = err.status || 500;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
      if (status === 401 || status === 403) {
        // Render Unauthroized User Page
        res.status(status);
        return res.render('401.pug');
      }
      return res.status(status).send({ message: err.message });
    });
  });
})();

app.listen(config.AGENDA_PORT, () =>
  logger.info(`Listening on Port: ${config.AGENDA_PORT}`)
);

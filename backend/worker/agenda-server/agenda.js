/**
 * AgendaJS Background Processing
 *
 * The scheduled task setup and startup script
 */

/**
 * Module dependencies
 */
const path = require('path');
const cors = require('cors');
const Agenda = require('agenda');
const Agendash = require('agendash2');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('regenerator-runtime/runtime'); // For Bundling async/await syntax

/**
 * Configuration
 */
const config = require('../../config')[process.env.NODE_ENV || 'development'];

/**
 * DB and Logger Libraries
 */
const logger = require('../../lib/logger/logger');
const mongoDB = require('../../lib/db/mongo.js');

// Authentication Service
const {
  loginRequired,
} = require('../../lib/middlewares/Authentication/AuthMiddlewares');

const app = express();
(async function run() {
  mongoDB.connectMongo(config.database.mongo).then(async (connection) => {
    // Instantiate an Agenda Instance that will Process the Job Processor
    // Every Minute locking only 2 Job at a Time to Run
    const agenda = new Agenda()
      .processEvery('5 minutes')
      .lockLimit(2)
      .mongo(connection.db, 'AgendaJobs');

    /**
     * Import Jobs
     */
    require('../jobs/DailyReport')(agenda, config);
    require('../jobs/Reservation')(agenda);
    require('../jobs/EmailJobs')(agenda, config);

    // Using Helmet Doesn't Render Agendash Properly
    // app.use(helmet());

    // Pug Setup
    app.set('view engine', 'pug');
    if (process.env.NODE_ENV === 'production') {
      app.set('views', path.join(__dirname, './views'));
    } else {
      app.set('views', path.join(__dirname, '../../views'));
    }

    // In Production, app is behind a proxy so trust X-Forwarded-Host headers
    app.set('trust proxy', true);

    app.use(
      cors({
        origin: config.clientDomain,
        credentials: true,
      })
    );

    // Cookie Setup for Auth
    app.use(cookieParser());

    /**
     * Set the User if token in defined in the cookie.
     */
    app.use((req, res, next) => {
      try {
        const { token } = req.cookies;
        if (!token) throw new Error('Undefined Token');
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
      } catch (err) {
        req.user = undefined;
        const error = new Error('Unauthorized User');
        error.status = 401;
        next(error);
      }
    });

    app.use('/dash', loginRequired, Agendash(agenda));

    await agenda.start();

    // Send Repeating Jobs Into The Job Processor

    // Generate Daily Reports
    await agenda.every(
      '00 00 * * *',
      'LazyU_GenerateDailyReport',
      `Generates New Daily Report`,
      {
        timezone: 'America/Denver',
      }
    );

    await agenda.every(
      '00 00 * * *',
      'FairValue_GenerateDailyReport',
      `Generates New Daily Report`,
      {
        timezone: 'America/Denver',
      }
    );

    // Update Current Reservation
    await agenda.every(
      '15 00 * * *',
      'FairValue_UpdateCurrentReservation',
      `Moved Incoming Reservations`,
      {
        timezone: 'America/Denver',
      }
    );

    await agenda.every(
      '15 00 * * *',
      'LazyU_UpdateCurrentReservation',
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

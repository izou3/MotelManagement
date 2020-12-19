/*
 * Module dependencies.
 */
const path = require('path');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const RateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { isCelebrateError } = require('celebrate');

const logger = require('../../lib/logger/logger');
const routes = require('./routes/index');
const authRoutes = require('./routes/authRoute');

const {
  loginRequired,
  loginCheck,
} = require('../../lib/middlewares/Authentication/AuthMiddlewares');

/*
 * Main Express Middleware
 */
module.exports = (param) => {
  const { values } = param;
  const { config } = param;
  const mongo = values[0];
  const sqlPool = values[1];
  const app = express();

  // Pug Setup
  app.set('view engine', 'pug');
  if (process.env.NODE_ENV === 'production') {
    app.set('views', path.join(__dirname, './views'));
  } else {
    app.set('views', path.join(__dirname, '../../views'));
  }

  // In Production, app is behind a proxy so trust X-Forwarded-Host headers
  app.set('trust proxy', true);

  // Cors from Frontend Server
  app.use(
    cors({
      origin: config.clientDomain,
      credentials: true,
    })
  );

  // Helmet Setup
  app.use(helmet());

  // Cookie Setup for Auth
  app.use(cookieParser());

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // Http Request Logger
  app.use(require('morgan')('dev', { stream: logger.stream }));

  // Rate Limit Setup
  // Within 15 mins, an IP address can only do 100 requests
  const limiter = new RateLimit({
    windowMs: 15 * 50 * 1000, // 15 minute
    max: 100, // limit number of request per IP
    delayMs: 0, // disables delays
  });

  //  apply to all requests
  app.use(limiter);

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
    } finally {
      next();
    }
  });

  // Test to see if authentication exists
  app.use('/validAccess', loginCheck);

  // Authentication Routes of Login, Register, and Logout
  app.use('/user', authRoutes({ sqlPool }));

  // API Routes to Access Reservations and Customers
  app.use('/api', loginRequired, routes({ mongo, sqlPool }));

  // 404 Error handler
  app.use((req, res, next) => {
    const error = new Error('Undefined Route');
    error.status = 404;
    next(error);
  });

  // Error handler
  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.log(config.clientDomain);
    if (isCelebrateError(err)) {
      // if joi produces an error, it's likely a client-side problem
      return res.status(400).json({
        message: 'Failed to Validate Data',
      });
    }
    // otherwise, it's probably a server-side problem.
    res.locals.message = err.message;
    const status = err.status || 500; // If no status is provided, let's assume it's a 500
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    if (status === 401 || status === 403) {
      // Render Unauthroized User Page
      res.status(status);
      return res.render('401.pug');
    }
    return res.status(status).send({ message: err.message });
  });

  return app;
};

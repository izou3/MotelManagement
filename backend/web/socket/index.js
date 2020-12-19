const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const logger = require('../../lib/logger/logger');

module.exports = (param) => {
  const { config } = param;

  const io = require('socket.io')({
    cors: {
      origin: config.clientDomain,
      methods: ['GET', 'POST'],
      allowedHeaders: ['my-custom-header'],
      credentials: true,
    },
  });

  // Admin NS
  const admin = io.of('/admin');
  admin.use((socket, next) => {
    logger.info(`${socket.id} joined`);
    logger.info('Auth Check Socket Middleware');
    try {
      // Might be undefined if no cookies exist
      // If token is verified, join room in case of reconnect.
      const { token } = cookie.parse(socket.handshake.headers.cookie);
      if (token) {
        try {
          const { HotelID } = jwt.verify(token, process.env.JWT_SECRET_KEY);
          socket.join(HotelID);
        } catch (err) {
          logger.error('Not Authenticated');
        }
      }
    } catch (err) {
      logger.info(err);
    } finally {
      next();
    }
  });

  admin.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);
    /**
     * 1 = Reservation
     * 2 = Report
     * 3 = Staff
     * 4 = Events
     */
    socket.on('action', (action) => {
      const { type, payload } = action;
      const [, actionType, command] = type.split('/');
      if (type === 'server/login') {
        // Payload is MotelID of Login
        // Joins User to Room
        socket.join(payload);
        logger.info(`Joining Room: ${payload}`);
      } else if (type === 'server/logout') {
        // Payload is MotelID of Logout
        // Leaves Room
        socket.leave(payload);
        logger.info(`Leaving Room: ${payload}`);
      } else if (actionType === '1') {
        require('./events/Reservation')({ admin, command, payload, logger });
      } else if (actionType === '2') {
        require('./events/Report')({ admin, command, payload, logger });
      } else if (actionType === '3') {
        require('./events/Staff')({ admin, command, payload, logger });
      } else if (actionType === '4') {
        require('./events/Event')({ admin, socket, command, payload, logger });
      } else {
        logger.error('Unidentified Type from base');
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket Disconnected: ${socket.id}`);
    });
  });

  return io;
};

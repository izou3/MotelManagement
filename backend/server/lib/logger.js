/**
 * Module Dependencies
 */
const { createLogger, format, transports } = require('winston');

const { combine, timestamp, simple, printf } = format;

/**
 * Create a Winston and Morgan Logger
 */
const logger = createLogger({
  level: 'debug',
  format: combine(
    timestamp(),
    simple(),
    printf((msg) => `${msg.timestamp} - ${msg.level}: ${msg.message}`)
  ),
  transports: [new transports.Console()],
});

logger.stream = {
  write(message) {
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  },
};

module.exports = logger;

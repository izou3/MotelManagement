/**
 * Logger to only log if not in Production Mode
 * @param {String} msg
 */
const logger = (msg) => {
  // eslint-disable-next-line no-console
  if (process.env.NODE_ENV !== 'production') console.log(msg);
};

module.exports = logger;

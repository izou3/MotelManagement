/**
 * Logger to only log if not in Production Mode
 * @param {String} msg
 */
const logger = (msg) => {
  if (process.env.NODE_ENV !== 'production') console.log(msg);
};

module.exports = logger;

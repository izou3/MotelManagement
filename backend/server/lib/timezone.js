const momenttz = require('moment-timezone');

// Set the default timezone for the backend
module.exports = momenttz().tz('America/Denver');

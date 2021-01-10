const moment = require('moment');

module.exports = {
  /**
   * Formats Dates Properly for POST/PUT Operations
   * on Reservation/Maintenance Objects
   */
  FormatDataDate: (req, res, next) => {
    const { checkIn, checkOut } = req.body;
    if (checkIn) {
      const formattedCheckIn = moment(checkIn).format('YYYY-MM-DDT12:00:00[Z]');
      req.body.checkIn = formattedCheckIn;
    }
    if (checkOut) {
      const formattedCheckOut = moment(checkOut).format(
        'YYYY-MM-DDT12:00:00[Z]'
      );
      req.body.checkOut = formattedCheckOut;
    }
    return next();
  },

  /**
   * Format Dates Properly for DailyReport Updates
   */
  FormatReportDate: (req, res, next) => {
    const { startDate, endDate } = req.body;
    if (startDate) {
      const formattedStartDate = moment
        .utc(startDate)
        .format('YYYY-MM-DDT12:00:00[Z]');
      req.body.startDate = formattedStartDate;
    }
    if (endDate) {
      const formattedEndDate = moment
        .utc(endDate)
        .format('YYYY-MM-DDT12:00:00[Z]');
      req.body.endDate = formattedEndDate;
    }
    return next();
  },

  /**
   * Format Dates Properly for Search Queries
   */
  FormatSearchDate: (req, res, next) => {
    const { start, end } = req.query;
    if (start) {
      req.query.start = moment(start).format('YYYY-MM-DD');
    }
    if (end) {
      req.query.end = moment(end).format('YYYY-MM-DD');
    }
    return next();
  },
};

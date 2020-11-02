/**
 * Daily Report Agenda Job
 */

/**
 * Module Dependencies
 */
const moment = require('moment');

// DailyReport Controller
const DailyReport = require('../services/report/Report');

/**
 * Function that Defines Jobs Associated with Daily Report
 *
 * @param {Object} agenda AgendaJS Object
 * @param {Object} config Configuration Object
 */
module.exports = (agenda, config) => {
  const Report = new DailyReport(config.RoomNum);

  /**
   * GenerateDailyReport Job
   *
   * Job that executes periodically at 3:00 AM MT to generate a
   * new Daily Report for the day
   */
  agenda.define('GenerateDailyReport', async (job, done) => {
    const yesterday = moment(moment().subtract(1, 'days')).format('YYYY-MM-DD');
    const today = moment().format('YYYY-MM-DD');

    try {
      const response = await DailyReport.getReport(yesterday);
      const PrevReport = response ? response.Stays : {};
      const result = Report.generateDailyReport(yesterday, today, PrevReport);
      const FinalReport = await DailyReport.insertReport(result);
      if (FinalReport) done();
      else {
        throw new Error('Failed Job');
      }
    } catch (err) {
      done(err);
    }
  });
};

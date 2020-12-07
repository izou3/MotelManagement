/**
 * Daily Report Agenda Job
 */
const moment = require('moment');

/**
 * Module Dependencies
 */
const LazyUConfig = require('../../config/LazyU')[
  process.env.NODE_ENV || 'development'
];

const FairValueConfig = require('../../config/FairValue')[
  process.env.NODE_ENV || 'development'
];

// Generate DailyReport Command
const {
  GenerateDailyReportCommand,
} = require('../../services/JobCommands/index');
/**
 * Function that Defines Jobs Associated with Daily Report
 *
 * @param {Object} agenda AgendaJS Object
 */
module.exports = (agenda) => {
  /**
   * GenerateDailyReport Job
   *
   * Job that executes periodically at 3:00 AM MT to generate a
   * new Daily Report for the day
   */
  agenda.define('LazyU_GenerateDailyReport', async (job, done) => {
    const { HotelID } = LazyUConfig;
    const today = moment().format('YYYY-MM-DD');
    const yesterday = moment(moment().subtract(1, 'days')).format('YYYY-MM-DD');

    return GenerateDailyReportCommand(HotelID, today, yesterday)
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  agenda.define('FairValue_GenerateDailyReport', async (job, done) => {
    const { HotelID } = FairValueConfig;
    const today = moment().format('YYYY-MM-DD');
    const yesterday = moment(moment().subtract(1, 'days')).format('YYYY-MM-DD');

    return GenerateDailyReportCommand(HotelID, today, yesterday)
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
};

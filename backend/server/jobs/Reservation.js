/**
 * Reservation jobs
 * 1.  Move qualified reservations from Pending to Current
 * 2.  Move qualified reservations from Pending to Overdue
 */

/**
 * Module Dependencies
 */
const debug = require('debug')('motel:agenda');
const Moment = require('moment');

// Pending Reservation Controller
const Pending = require('../services/reservations/PendingRes');

/**
 * Defines jobs associated with Pending Reservation
 *
 * @param {Object} agenda Agenda Object
 */
module.exports = (agenda) => {
  /**
   * UpdateCurrent Job
   *
   * Move all reservations, that are within 2 days of the check-in time,
   * from Pending Reservation to Current Reservation
   */
  agenda.define('UpdateCurrent', async (job, done) => {
    const start = Moment(new Date()).startOf('day').toDate();
    const end = Moment(new Date()).startOf('day').add(2, 'days').toDate();

    try {
      await Pending.moveToCurrRes(start, end);
      done();
    } catch (err) {
      job.fail(err);
      await job.save();
    }
  });

  agenda.define('hello', async (job, done) => {
    console.log('hello');
    done();
  });
};

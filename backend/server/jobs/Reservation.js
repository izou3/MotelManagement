/**
 * Reservation jobs
 * 1.  Move qualified reservations from Pending to Current
 */

/**
 * Module Dependencies
 */
const debug = require('debug')('motel:agenda');
const moment = require('moment');

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
    const start = moment().format('YYYY-MM-DD');
    const end = moment(moment().add(3, 'days')).format('YYYY-MM-DD');

    try {
      await Pending.moveToCurrRes(start, end);
      done();
    } catch (err) {
      job.fail(err);
      await job.save();
    }
  });
};

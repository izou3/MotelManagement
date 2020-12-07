const moment = require('moment');

const LazyUConfig = require('../../config/LazyU')[
  process.env.NODE_ENV || 'development'
];

const FairValueConfig = require('../../config/FairValue')[
  process.env.NODE_ENV || 'development'
];

// UpdateCurrent Command
const {
  UpdateToCurrentReservationsCommand,
} = require('../../services/JobCommands/index');

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
  agenda.define('LazyU_UpdateCurrentReservation', async (job, done) => {
    const { HotelID } = LazyUConfig;
    const StartDate = moment().format('YYYY-MM-DDT00:00:00[Z]');
    const EndDate = moment(moment().add(3, 'days')).format(
      'YYYY-MM-DDT00:00:00[Z]'
    );

    return UpdateToCurrentReservationsCommand(HotelID, StartDate, EndDate)
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  agenda.define('FairValue_UpdateCurrentReservation', async (job, done) => {
    const { HotelID } = FairValueConfig;
    const StartDate = moment().format('YYYY-MM-DDT00:00:00[Z]');
    const EndDate = moment(moment().add(3, 'days')).format(
      'YYYY-MM-DDT00:00:00[Z]'
    );

    return UpdateToCurrentReservationsCommand(HotelID, StartDate, EndDate)
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
};

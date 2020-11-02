/**
 * Module Dependencies
 */
const mongoose = require('mongoose');
const debug = require('debug')('motel:debug');
const moment = require('moment');

// Reservation Schema and The Collections
const ReservationSchema = require('../../models/ReservationModel');

const ReservationSch = mongoose.model(
  'Reservation',
  ReservationSchema,
  'PendingReservation'
);
const DeleteResSch = mongoose.model(
  'DeleteReservation',
  ReservationSchema,
  'DeleteReservation'
);
const CurrResSch = mongoose.model(
  'CurrentReservation',
  ReservationSchema,
  'CurrentReservation'
);

class PendingReservation {
  /** ****************************
   * SEARCH CONTROLLERS
   ***************************** */

  /**
   * Get Reservation Documents based on firstName key
   * @param {String} first first names of the guest
   */
  static getReservationByName(first) {
    const query = ReservationSch.find({ firstName: first }).select('-__v -_id');
    return query.lean();
  }

  /**
   * Get Single Reservation Document based on BookingID
   * @param {Number} id the BookingID of the the Reservation
   */
  static getReservationByID(id) {
    const query = ReservationSch.findOne({ BookingID: id }).select('-__v -_id');
    return query.lean();
  }

  /**
   * Get Reservation Documents with Check-In Dates between the given args
   * @param {Date} start The Start of the check-in date
   * @param {Date} end   the end of the check-in date
   */
  static getReservationByCheckIn(start, end) {
    const query = ReservationSch.find({
      checkIn: {
        $gte: start,
        $lt: end,
      },
    }).select('-__v -_id');
    return query.lean();
  }

  /**
   * Get Reservation Documents with Check-out Dates between the given args
   * @param {Date} start The Start of the check-in date
   * @param {Date} end   The end of the check-in date
   */
  static getReservationByCheckOut(start, end) {
    const query = ReservationSch.find({
      checkOut: {
        $gte: start,
        $lt: end,
      },
    }).select('-__v -_id');
    return query.lean();
  }

  /** ****************************
   * CRUD CONTROLLERS
   ***************************** */

  /**
   * Add new Reservation to Pending Collection
   *
   * @param {Object} req Request Object of HTTP Request Header
   */
  static addNewReservation(req, agenda) {
    const newReservation = new ReservationSch(req.body);
    return new Promise((resolve, reject) => {
      newReservation.save((err, data) => {
        if (err) {
          reject(new Error(err.message));
        } else if (!data) {
          reject(new Error('Failed to Save'));
        }

        // Send Reservation Confirmation Email
        if (req.body.email.trim().length !== 0) {
          debug('sending Confirmation Email');
          agenda.now('ReservationConfirmation', {
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            numGuests: req.body.numGuests,
            checkIn: moment(req.body.checkIn).format('dddd, MMMM Do YYYY'),
            checkOut: moment(req.body.checkOut).format('dddd, MMMM Do YYYY'),
            pricePaid: req.body.pricePaid,
          });
        }
        resolve('Successfully Created New Reservation');
      });
    });
  }

  /**
   * Update a Reservation Document with new Data
   *
   * @param {Number} BookingID BookingID of soon-to-be Reservation
   * @param {Object} req Request Object of HTTP Request Header
   */
  static updateReservationByID(BookingID, req) {
    return new Promise((resolve, reject) => {
      ReservationSch.findOneAndUpdate(
        { BookingID },
        req.body,
        (err, response) => {
          if (err) {
            reject(new Error('Failed Connection with Server'));
          } else if (!response) {
            reject(new Error('Reservation is Not Defined'));
          }
          resolve('Successfully Updated Reservation');
        }
      );
    });
  }

  /**
   * Move reservation from Pending to Delete Collection
   *
   * @param {Number} id - The BookingID of reservation to Move
   */
  static async deleteReservationByID(id) {
    const session = await mongoose.startSession();
    await session.startTransaction();

    try {
      const deleteRes = await ReservationSch.findOneAndDelete({
        BookingID: id,
      })
        .select('-__v -_id')
        .lean()
        .session(session);

      if (!deleteRes) throw new Error('Reservation is Not Defined');

      await DeleteResSch.create([deleteRes], { session });
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Delete Reservations in Pending Collection
   *
   * @param {Date} date The date of the check-in of the reservation
   */
  static deleteResByDate(date) {
    return new Promise((resolve, reject) => {
      ReservationSch.deleteMany({ checkIn: date }, (err, response) => {
        if (err) {
          reject(err);
        }
        resolve('Successfully deleted');
      });
    });
  }

  /**
   * Move reservation from Pending to Current based on updated check-in date
   * IMPORTANT: when moving back make sure that field Checked = 2
   *
   * @param {Object} data => the updated data object
   */
  static async updateToCurr(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await ReservationSch.findOneAndDelete({
        BookingID: data.BookingID,
      }).session(session);

      if (!result) throw new Error('Reservation Does Not Exist');

      await CurrResSch.create([{ ...data, Checked: 2 }], { session });
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Move reservation from Pending to Current based on bookingID
   *
   * @param {Number} BookingID BookingID of Reservation
   */
  static async moveToCurrResByID(BookingID) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await ReservationSch.find({ BookingID })
        .select('-__v -_id')
        .lean()
        .session(session);

      if (result.length === 0) {
        throw new Error('No Documents');
      }

      await CurrResSch.insertMany(result, { session });
      await ReservationSch.deleteOne({ BookingID }, { session });

      await session.commitTransaction();
    } catch (err) {
      debug(err);
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  /**
   * Move Matching Reservations from Pending to Current Collection
   *
   * @param {Date} start Start of the Check-In Date of Reservation
   * @param {Date} end   End of the Check-In Date of Reservation
   */
  // eslint-disable-next-line consistent-return
  static async moveToCurrRes(start, end) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await ReservationSch.find({
        checkIn: { $gte: start, $lt: end },
      })
        .select('-__v -_id')
        .lean()
        .session(session);

      if (result.length === 0) {
        // No Reservations Exist within the check-in time period
        await session.abortTransaction();
        return [];
      }

      await CurrResSch.insertMany(result, { session });

      const movedRes = await ReservationSch.deleteMany(
        { checkIn: { $gte: start, $lt: end } },
        { session }
      );

      await session.commitTransaction();
      return movedRes;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}

module.exports = PendingReservation;

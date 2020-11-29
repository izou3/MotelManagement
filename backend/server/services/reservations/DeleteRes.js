/**
 * Moduel Dependencies
 */
const mongoose = require('mongoose');

// Reservation Schema
const ReservationSchema = require('../../models/ReservationModel');

const DeleteResSch = mongoose.model(
  'Reservation',
  ReservationSchema,
  'DeleteReservation'
);

class DeleteReservation {
  /** ****************************
   * SEARCH CONTROLLERS
   ***************************** */

  /**
   * Get All Documents Under DeleteReservation Collection
   */
  static getAllDeleteReservation() {
    const query = DeleteResSch.find({}).select('-__v -_id');
    return query.lean();
  }

  /**
   * Get Reservation Documents based on firstName key
   * @param {String} first first names of the guest
   */
  static getReservationByName(first) {
    const query = DeleteResSch.find({ firstName: first }).select('-__v -_id');
    return query.lean();
  }

  /**
   * Get Single Reservation Document based on BookingID
   * @param {Number} id the BookingID of the the Reservation
   */
  static getReservationByID(id) {
    const query = DeleteResSch.findOne({ BookingID: id }).select('-__v -_id');
    return query.lean();
  }

  /**
   * Get Reservation Documents with Check-In Dates between the given args
   * @param {Date} start The Start of the check-in date
   * @param {Date} end   the end of the check-in date
   */
  static getReservationByCheckIn(start, end) {
    const query = DeleteResSch.find({
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
    const query = DeleteResSch.find({
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
   * Add Reservation Object to Delete Collection
   * @param {Object} resData The New Reservation Object
   */
  static addReservation(resData) {
    const newReservation = new DeleteResSch(resData);
    return new Promise((resolve, reject) => {
      newReservation.save((err) => {
        if (err) {
          reject(new Error('Failed Connection with Server'));
        }
        resolve('Successfully Created New Reservation');
      });
    });
  }

  /**
   * Update Reservation Record in Delete Collection
   * @param {Object} resData The Updated Reservation Object
   */
  static updateReservation(resData) {
    const query = DeleteResSch.findOneAndUpdate(
      { BookingID: resData.BookingID },
      resData
    )
      .select('-__v -_id')
      .lean();
    return query;
  }

  /**
   * Delete All Collections in Delete Collection
   */
  static deleteAllReservation() {
    const query = DeleteResSch.remove({});
    return query.lean();
  }

  /**
   * Delete a document in Delete Collection with Matching BookingID
   * @param {*} BookingID The bookingID of the Reservation
   */
  static deleteReservationByID(BookingID) {
    const query = DeleteResSch.findOneAndDelete({ BookingID }).lean();
    return query;
  }
}

module.exports = DeleteReservation;

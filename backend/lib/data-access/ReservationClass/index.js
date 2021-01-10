const Motel = require('../Motel');

class Reservation extends Motel {
  get getConnection() {
    return this._connection;
  }

  get getHotelID() {
    return this._HotelID;
  }

  /**
   * Reads All Reservation Documents Residing within specified Collection
   * @returns An Array of documents w/o fields specified
   */
  getAllReservations() {
    return this._connection
      .find({ HotelID: this._HotelID })
      .select('-__v -_id -created_date')
      .lean();
  }

  /**
   * @returns An Array of documents in collection with matching firstName
   */
  getReservationByName(firstName) {
    return this._connection
      .find({
        $and: [{ firstName }, { HotelID: this._HotelID }],
      })
      .select('-__v -_id -created_date')
      .lean();
  }

  /**
   * @returns One document in collection with matching BookingID
   */
  getReservationByID(BookingID) {
    return this._connection
      .findOne({
        $and: [{ BookingID }, { HotelID: this._HotelID }],
      })
      .select('-__v -_id -created_date')
      .lean();
  }

  /**
   * @returns An Array of documents in collection with matching CheckIn Date Range
   */
  getReservationByCheckIn(startDate, endDate) {
    return this._connection
      .find({
        $and: [
          {
            checkIn: {
              $gte: startDate,
              $lt: endDate,
            },
          },
          { HotelID: this._HotelID },
        ],
      })
      .select('-__v -_id -created_date')
      .lean();
  }

  /**
   * @returns An Array of documents in collection with matching CheckOut Date Range
   */
  getReservationByCheckOut(startDate, endDate) {
    return this._connection
      .find({
        $and: [
          {
            checkOut: {
              $gte: startDate,
              $lt: endDate,
            },
          },
          { HotelID: this._HotelID },
        ],
      })
      .select('-__v -_id -created_date')
      .lean();
  }

  /**
   * @param {Object} resObj New Reservation Object
   * @param {Object} session Mongoose Transaction Session Object
   * @returns Returns Array of length 1 with Arr[0] = resObj
   */
  createOneNewReservation(resObj, session = null) {
    if (session) {
      return this._connection.create([resObj], { session });
    }
    return this._connection.create([resObj]);
  }

  /**
   * @param {Array} resObjArr Array of Reservation Objects to Create
   * @param {Object} session Mongoose Transaction Session Object
   * @returns Returns Array of Reservation Objects
   */
  createManyNewReservations(resObjArr, session = null) {
    if (session) {
      return this._connection.create(resObjArr, { session });
    }
    return this._connection.create(resObjArr);
  }

  /**
   * @param {Object} resObj The Updated Reservation Object
   * @param {Object} session Mongoose Transaction Session Object
   * @param {Boolean} isUpdatedVersion Whether the function should return
   *  the original Reservation or the Newly Updated Object
   *
   * @returns The original or new Reservation Object
   */
  updateReservation(resObj, session = null, isUpdatedVersion = true) {
    if (session) {
      return this._connection
        .findOneAndUpdate({ BookingID: resObj.BookingID }, resObj, {
          new: isUpdatedVersion,
        })
        .select('-__v -_id -created_date')
        .lean()
        .session(session);
    }
    return this._connection
      .findOneAndUpdate({ BookingID: resObj.BookingID }, resObj, {
        new: isUpdatedVersion,
      })
      .select('-__v -_id -created_date')
      .lean();
  }

  /**
   * @param {Number} BookingID BookingID of Reservation to Deleted
   * @param {Object} session Mongoose Transaction Session Object
   *
   * @returns The Deleted Reservation Object
   */
  deleteReservation(BookingID, session = null) {
    if (session) {
      return this._connection
        .findOneAndDelete({ BookingID })
        .select('-__v -_id -created_date')
        .lean()
        .session(session);
    }
    return this._connection
      .findOneAndDelete({ BookingID })
      .select('-__v -_id -created_date')
      .lean();
  }

  /**
   * Delete Many Documents in a Collection based on Mathcing Query
   * @param {Object} query
   * @param {Object} session
   * @returns {
   *  "n": Number of matched documents,
   *  "ok": If Operation was Successful,
   * "deletedCount": Number of Deleted Documents
   * }
   */
  deleteManyReservation(query, session = null) {
    if (session) {
      return this._connection.deleteMany(query, { session });
    }
    return this._connection.deleteMany(query);
  }
}

module.exports = Reservation;

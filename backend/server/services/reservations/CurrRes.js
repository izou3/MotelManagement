/**
 * Module Dependencies
 */
const mongoose = require('mongoose');
const debug = require('debug')('motel:http');
const moment = require('moment');

// Reservation Model
const ReservationSchema = require('../../models/ReservationModel');

// Schema Imports
const DailyReportSchema = require('../../models/DailyReport');

const CurrResSch = mongoose.model(
  'Reservation',
  ReservationSchema,
  'CurrentReservation'
);
const PendResSch = mongoose.model(
  'Reservation',
  ReservationSchema,
  'PendingReservation'
);
const DeleteResSch = mongoose.model(
  'Reservation',
  ReservationSchema,
  'DeleteReservation'
);
const Report = mongoose.model('DailyReport', DailyReportSchema, 'DailyReport');
const ReservationSch = 'Room';
const HouseKeepingSch = 'HouseKeeping';

class CurrentReservation {
  /** ****************************
   * SEARCH CONTROLLERS
   ***************************** */

  /**
   * Get All Reservation Documents in Current Collection
   */
  static getCurrReservation() {
    const query = CurrResSch.find({}).select('-__v -_id -created_date');
    return query.lean();
  }

  /**
   * Get Single Reservation Document based on BookingID
   * @param {Number} id the BookingID of the the Reservation
   */
  static getCurrReservationByID(id) {
    const query = CurrResSch.findOne({ BookingID: id }).select('-__v -_id');
    return query.lean();
  }

  /**
   * Get Reservation Documents based on firstName key
   * @param {String} first first names of the guest
   */
  static getCurrReservationByName(first) {
    const query = CurrResSch.find({ firstName: first }).select('-__v -_id');
    return query.lean();
  }

  /** ****************************
   * CRUD CONTROLLERS
   ***************************** */

  /**
   * Add a new current reservation to DB. If guest is checked in, add it as a transaction
   * to the DailyReport DB.
   *
   * @param {Object} req
   * @param {String} roomType
   * @param {Object} agenda
   */
  static async addNewCurrReservation(req, roomType, agenda) {
    const today = moment().format('YYYY-MM-DD');
    // Guest has not checked in yet so is not in the DailyReport
    // Test Cases Converts Checked into String
    if (req.body.Checked === 2) {
      const currReservation = new CurrResSch(req.body);
      return new Promise((resolve, reject) => {
        currReservation.save((err, result) => {
          if (err) {
            debug(err);
            reject(new Error('Connection with the Server'));
          } else if (!result) {
            reject(new Error('Failed to Save'));
          } else {
            debug(result);

            // Send Confirmation Email if email is defined
            if (req.body.email.trim().length !== 0) {
              debug('sending Confirmation Email');
              agenda.now('ReservationConfirmation', {
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                numGuests: req.body.numGuests,
                checkIn: moment(req.body.checkIn).format('dddd, MMMM Do YYYY'),
                checkOut: moment(req.body.checkOut).format(
                  'dddd, MMMM Do YYYY'
                ),
                pricePaid: req.body.pricePaid,
              });
            }
            resolve(result);
          }
        });
      });
    }

    // Guest is Checked In so Add it to Current and DailyReport
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // can set initial field to be whoever is login as user
      const update = { $set: {} };
      update.$set[`Stays.${req.body.RoomID}.${ReservationSch}`] = {
        BookingID: req.body.BookingID,
        type: '',
        payment: '',
        startDate: moment(req.body.checkIn).format('YYYY-MM-DDT12:00:00[Z]'),
        endDate: moment(moment(req.body.checkOut).subtract(1, 'day')).format(
          'YYYY-MM-DDT12:00:00[Z]'
        ),
        paid: true,
        rate: req.body.pricePaid,
        tax: req.body.tax,
        initial: '',
      };

      update.$set[`Stays.${req.body.RoomID}.${HouseKeepingSch}`] = {
        status: 'O',
        type: roomType,
        houseKeeper: '',
        notes: '',
      };

      const UpdatedReport = await Report.findOneAndUpdate(
        { Date: today },
        update,
        {
          new: true,
        }
      )
        .select('-__v -_id')
        .lean()
        .session(session);

      if (!UpdatedReport) throw new Error('Report is Not Defined');

      await CurrResSch.create([{ ...req.body }], { session });
      await session.commitTransaction();
      return UpdatedReport;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  /**
   * Updates a Current Reservation from the Current Collection.
   * Also makes any changes/updates in current reservation reflective in
   * its corresponding DailyReport entry.
   *
   * @param {Number} id The BookingID of the Reservation
   * @param {req} Object The Requet Object from the HTTP Request
   */
  static async updateReservationByID(id, data) {
    debug('here in update');
    // Guest has not checked in yet so is not in the DailyReport
    if (data.Checked === 0 || data.Checked === 2) {
      return new Promise((resolve, reject) => {
        CurrResSch.findOneAndUpdate(
          { BookingID: id },
          data,
          { new: true },
          (err, UpdatedRes) => {
            if (err) {
              reject(new Error('Connection with the Server'));
            } else if (!UpdatedRes) {
              reject(new Error('Reservation Does Not Exist'));
            }
            resolve(UpdatedRes);
          }
        );
      });
    }
    // Guest is Checked In so will have to Update in DailyReport aswell
    const session = await mongoose.startSession();
    session.startTransaction();
    const today = moment().format('YYYY-MM-DD');

    try {
      const UpdatedResponse = { UpdatedRes: data, UpdatedReport: {} }; // Object to Hold the Newly Updated Report
      const originalRes = await CurrResSch.findOneAndUpdate(
        { BookingID: id },
        data
      )
        .select('-__v -_id')
        .lean()
        .session(session);

      if (!originalRes) throw new Error('Reservation Does Not Exist');

      const originalRep = await Report.findOne({ Date: today })
        .select('-__v -_id')
        .lean()
        .session(session);

      if (!originalRep) throw new Error('Report is Not Defined');

      const originalRec =
        originalRep.Stays[`${originalRes.RoomID}`][`${ReservationSch}`];

      // Room Number Has Been Changed
      if (originalRes.RoomID !== data.RoomID) {
        const updateRoom = { $set: {} };
        updateRoom.$set[`Stays.${originalRes.RoomID}.${ReservationSch}`] = {};
        updateRoom.$set[`Stays.${originalRes.RoomID}.${HouseKeepingSch}`] = {
          status: 'C',
          type:
            originalRep.Stays[`${originalRes.RoomID}`][HouseKeepingSch].type,
          houseKeeper: '',
          notes: '',
        };
        updateRoom.$set[`Stays.${data.RoomID}.${HouseKeepingSch}`] = {
          status: 'O',
          type: originalRep.Stays[`${data.RoomID}`][HouseKeepingSch].type,
          houseKeeper:
            originalRep.Stays[`${data.RoomID}`][HouseKeepingSch].houseKeeper,
          notes: originalRep.Stays[`${data.RoomID}`][HouseKeepingSch].notes,
        };
        await Report.findOneAndUpdate({ Date: today }, updateRoom).session(
          session
        );
      }

      const newRate =
        originalRec.rate + (data.pricePaid - originalRes.pricePaid);
      const newTax = originalRec.tax + (data.tax - originalRes.tax);

      const paidBool = newRate && newRate > 0 ? true : originalRec.paid;

      const updatedRec = { $set: {} };
      updatedRec.$set[`Stays.${data.RoomID}.${ReservationSch}`] = {
        BookingID: data.BookingID,
        type: originalRec.type ? originalRec.type : '',
        payment: originalRec.payment ? originalRec.payment : '',
        startDate: moment(data.checkIn).format('YYYY-MM-DDT12:00:00[Z]'),
        endDate: moment(moment(data.checkOut).subtract(1, 'day')).format(
          'YYYY-MM-DDT12:00:00[Z]'
        ),
        paid: paidBool,
        rate: Math.round((newRate + Number.EPSILON) * 100) / 100,
        tax: Math.round((newTax + Number.EPSILON) * 100) / 100,
        initial: originalRec.initial ? originalRec.initial : '',
      };

      // No need to check for Undefined Null Report b/c already checked above
      UpdatedResponse.UpdatedReport = await Report.findOneAndUpdate(
        { Date: today },
        updatedRec,
        { new: true }
      )
        .select('-__v -_id')
        .lean()
        .session(session);

      await session.commitTransaction();
      return UpdatedResponse;
    } catch (err) {
      debug(err);
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Move Reservations in Current Collection to Delete Collection
   *
   * Makes the changes also reflective in the Daily Report
   * @param {Number} id The BookingID of the Reservation
   */
  static async deleteReservationByID(id) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Can Only Delete CurrRes w/ Checked = 0
      const deleteRes = await CurrResSch.findOneAndDelete({
        BookingID: id,
      })
        .select('-__v -_id')
        .lean()
        .session(session);

      if (!deleteRes) throw new Error('Reservation Does Not Exist');

      await DeleteResSch.create([deleteRes], { session });
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
   * Delete Reservation Permanently as well as from the DailyReport Collection
   * Used to Check-Out Reservation
   * @param {Number} id The BookingID of the Reservation
   * @param {Number} prevRoom The Previous Room of the Reservation
   * @param {Date} date The Date of the DailyReport
   */
  static async deleteReservationPerm(id, date, roomType) {
    const session = await mongoose.startSession();
    session.startTransaction();

    const UpdatedResult = { PrevRoomID: undefined, UpdatedReport: {} };
    try {
      // get the previous RoomID in case that on checkOut, the RoomID was changed
      const prevRoomID = await CurrResSch.findOneAndDelete({ BookingID: id })
        .select('RoomID')
        .lean()
        .session(session);

      if (!prevRoomID) throw new Error('Reservation Does Not Exist');

      UpdatedResult.PrevRoomID = prevRoomID;

      const updateRoom = { $set: {} };
      updateRoom.$set[`Stays.${prevRoomID.RoomID}.${ReservationSch}`] = {};
      updateRoom.$set[`Stays.${prevRoomID.RoomID}.${HouseKeepingSch}`] = {
        status: 'C',
        type: roomType || 'W',
        houseKeeper: '',
        notes: '',
      };

      const UpdatedReport = await Report.findOneAndUpdate(
        { Date: date },
        updateRoom,
        { new: true }
      ).session(session);

      if (!UpdatedReport) throw new Error('Daily Report Does Not Exist');
      UpdatedResult.UpdatedReport = UpdatedReport;

      await session.commitTransaction();
      return UpdatedResult;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  /**
   * Move Reservation in Current to Pending Collection Given a Update request.
   *  if Reservation is Checked In, delete it from DailyReport as well
   *
   * @param {Object} data The Data of the Reservation
   */
  static async updateToPend(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await CurrResSch.findOneAndDelete({
        BookingID: data.BookingID,
      }).session(session);

      if (!result) throw new Error('Reservation Does Not Exist');

      await PendResSch.create([{ ...data, Checked: 2 }], { session });
      await session.commitTransaction();
      return result;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Check In guest by Uodating Checked key and Corresponding Report
   *
   * @param {Number} id BookingID of the Reservation
   * @param {Object} data Rreservation Object with Data to Check In with
   */
  static async checkInRes(id, data, roomType) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const today = moment().format('YYYY-MM-DD');

    try {
      const UpdatedResult = { UpdatedRes: {}, UpdatedReport: {} };

      // Update the Reservation
      const result1 = await CurrResSch.findOneAndUpdate(
        { BookingID: id },
        data,
        {
          new: true,
        }
      )
        .lean()
        .session(session);

      if (!result1) throw new Error('Reservation Does Not Exist');

      UpdatedResult.UpdatedRes = result1;

      // Create new record in Report
      const updatedRec = { $set: {} };
      updatedRec.$set[`Stays.${data.RoomID}.${ReservationSch}`] = {
        BookingID: data.BookingID,
        startDate: moment(data.checkIn).format('YYYY-MM-DDT12:00:00[Z]'),
        endDate: moment(moment(data.checkOut).subtract(1, 'day')).format(
          'YYYY-MM-DDT12:00:00[Z]'
        ),
        paid: true,
        rate: data.pricePaid,
        type: '',
        payment: '',
        initial: '',
        tax: data.tax,
      };
      updatedRec.$set[`Stays.${data.RoomID}.${HouseKeepingSch}`] = {
        status: 'O',
        type: roomType || 'W',
        houseKeeper: '',
        notes: '',
      };

      const result2 = await Report.findOneAndUpdate(
        { Date: today },
        updatedRec,
        { new: true }
      )
        .lean()
        .session(session);

      if (!result2) throw new Error('Report Does Not Exist');

      UpdatedResult.UpdatedReport = result2;
      await session.commitTransaction();
      return UpdatedResult;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Move Reservation from Current to Arrivals by Updating the Checked key
   * as well as the record in DailyReport
   *
   * @param {Number} id BookingID of the Reservation
   * @param {Object} req The Request object from HTTP Header
   */
  static async moveToArrivals(id, data, roomType) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const today = moment().format('YYYY-MM-DD');

    try {
      const originalRes = await CurrResSch.findOneAndUpdate(
        { BookingID: id },
        data
      )
        .lean()
        .session(session);

      if (!originalRes) throw new Error('Reservation Does Not Exist');

      const updatedRec = { $set: {} };
      updatedRec.$set[`Stays.${originalRes.RoomID}.${ReservationSch}`] = {};
      updatedRec.$set[`Stays.${originalRes.RoomID}.${HouseKeepingSch}`] = {
        status: 'C',
        type: roomType || 'W',
        houseKeeper: '',
        notes: '',
      };
      const UpdatedReport = await Report.findOneAndUpdate(
        { Date: today },
        updatedRec,
        { new: true }
      )
        .lean()
        .session(session);

      if (!UpdatedReport) throw new Error('Report Does Not Exist');

      await session.commitTransaction();
      return UpdatedReport;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }
}

module.exports = CurrentReservation;

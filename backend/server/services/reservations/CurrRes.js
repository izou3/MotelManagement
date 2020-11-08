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
    const query = CurrResSch.find({}).select('-__v -id');
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
   */
  static async addNewCurrReservation(req, roomType, agenda) {
    const today = moment().format('YYYY-MM-DD');
    // Guest has not checked in yet so is not in the DailyReport
    if (req.body.Checked === 2) {
      const currReservation = new CurrResSch(req.body);
      return new Promise((resolve, reject) => {
        currReservation.save((err, result) => {
          if (err) {
            debug(err);
            reject(new Error('Connection with the Server'));
          }
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
              checkOut: moment(req.body.checkOut).format('dddd, MMMM Do YYYY'),
              pricePaid: req.body.pricePaid,
            });
          }
          resolve(result);
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
  static async updateReservationByID(id, req) {
    debug('here in update');
    // Guest has not checked in yet so is not in the DailyReport
    if (req.body.Checked === 0 || req.body.Checked === 2) {
      return new Promise((resolve, reject) => {
        CurrResSch.findOneAndUpdate(
          { BookingID: id },
          req.body,
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

    const UpdatedResponse = { UpdatedRes: req.body, UpdatedReport: {} }; // Object to Hold the Newly Updated Report
    try {
      const originalRes = await CurrResSch.findOneAndUpdate(
        { BookingID: id },
        req.body
      )
        .select('-__v -_id')
        .lean()
        .session(session);

      if (!originalRes) throw new Error('Reservation is Not Defined');

      const originalRep = await Report.findOne({ Date: today })
        .select('-__v -_id')
        .lean()
        .session(session);

      if (!originalRep) throw new Error('Report is Not Defined');

      const originalRec =
        originalRep.Stays[`${originalRes.RoomID}`][`${ReservationSch}`];

      // Room Number Has Been Changed
      if (originalRes.RoomID !== req.body.RoomID) {
        const updateRoom = { $set: {} };
        updateRoom.$set[`Stays.${originalRes.RoomID}.${ReservationSch}`] = {};
        updateRoom.$set[`Stays.${originalRes.RoomID}.${HouseKeepingSch}`] = {
          status: 'C',
          type:
            originalRep.Stays[`${originalRes.RoomID}`][HouseKeepingSch].type,
          houseKeeper: '',
          notes: '',
        };
        updateRoom.$set[`Stays.${req.body.RoomID}.${HouseKeepingSch}`] = {
          status: 'O',
          type: originalRep.Stays[`${req.body.RoomID}`][HouseKeepingSch].type,
          houseKeeper:
            originalRep.Stays[`${req.body.RoomID}`][HouseKeepingSch]
              .houseKeeper,
          notes: originalRep.Stays[`${req.body.RoomID}`][HouseKeepingSch].notes,
        };
        await Report.findOneAndUpdate({ Date: today }, updateRoom).session(
          session
        );
      }

      const newRate =
        originalRec.rate + (req.body.pricePaid - originalRes.pricePaid);
      const newTax = originalRec.tax + (req.body.tax - originalRes.tax);

      const updatedRec = { $set: {} };
      updatedRec.$set[`Stays.${req.body.RoomID}.${ReservationSch}`] = {
        BookingID: req.body.BookingID,
        type: originalRec.type,
        startDate: moment(req.body.checkIn).format('YYYY-MM-DDT12:00:00[Z]'),
        endDate: moment(moment(req.body.checkOut).subtract(1, 'day')).format(
          'YYYY-MM-DDT12:00:00[Z]'
        ),
        paid: originalRec.paid,
        rate: newRate,
        tax: newTax,
        initial: originalRec.initial,
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
    } catch (err) {
      debug(err);
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
    return UpdatedResponse;
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
  static async deleteReservationPerm(id, prevRoom, date, roomType) {
    const session = await mongoose.startSession();
    session.startTransaction();

    const UpdatedResult = { Room: 0, UpdatedReport: {} };
    try {
      const result1 = await CurrResSch.findOneAndDelete({ BookingID: id })
        .select('RoomID')
        .lean()
        .session(session);

      if (!result1) throw new Error('Reservation Does Not Exist');

      UpdatedResult.Room = result1;
      const updateRoom = { $set: {} };
      updateRoom.$set[`Stays.${prevRoom}.${ReservationSch}`] = {};
      updateRoom.$set[`Stays.${prevRoom}.${HouseKeepingSch}`] = {
        status: 'C',
        type: roomType,
        houseKeeper: '',
        notes: '',
      };

      const result2 = await Report.findOneAndUpdate(
        { Date: date },
        updateRoom,
        { new: true }
      ).session(session);

      if (!result1) throw new Error('Daily Report Does Not Exist');

      UpdatedResult.UpdatedReport = result2;

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
    return UpdatedResult;
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
   * @param {Object} req Request Object from the HTTP Request Header
   */
  static async checkInRes(id, req, roomType) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const today = moment().format('YYYY-MM-DD');

    const UpdatedResult = { UpdatedRes: {}, UpdatedReport: {} };
    try {
      // Update the Reservation
      const result1 = await CurrResSch.findOneAndUpdate(
        { BookingID: id },
        req.body,
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
      updatedRec.$set[`Stays.${req.body.RoomID}.${ReservationSch}`] = {
        BookingID: req.body.BookingID,
        startDate: moment(req.body.checkIn).format('YYYY-MM-DDT12:00:00[Z]'),
        endDate: moment(moment(req.body.checkOut).subtract(1, 'day')).format(
          'YYYY-MM-DDT12:00:00[Z]'
        ),
        paid: true,
        rate: req.body.pricePaid,
        tax: req.body.tax,
      };
      updatedRec.$set[`Stays.${req.body.RoomID}.${HouseKeepingSch}`] = {
        status: 'O',
        type: roomType,
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
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
    return UpdatedResult;
  }

  /**
   * Move Reservation from Current to Arrivals by Updating the Checked key
   * as well as the record in DailyReport
   *
   * @param {Number} id BookingID of the Reservation
   * @param {Object} req The Request object from HTTP Header
   */
  static async moveToArrivals(id, req, roomType) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const today = moment().format('YYYY-MM-DD');

    try {
      const originalRes = await CurrResSch.findOneAndUpdate(
        { BookingID: id },
        req.body
      )
        .lean()
        .session(session);

      if (!originalRes) throw new Error('Reservation Does Not Exist');

      const updatedRec = { $set: {} };
      updatedRec.$set[`Stays.${originalRes.RoomID}.${ReservationSch}`] = {};
      updatedRec.$set[`Stays.${originalRes.RoomID}.${HouseKeepingSch}`] = {
        status: 'C',
        type: roomType,
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

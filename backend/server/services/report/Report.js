/**
 * Module Dependencies
 */
const moment = require('moment');
const mongoose = require('mongoose');
const debug = require('debug')('motel:http');
const DailyReportSchema = require('../../models/DailyReport');
const ReservationSchema = require('../../models/ReservationModel');

/**
 * Mongoose Schema Creation
 */
const DailyReportSch = mongoose.model(
  'DailyReport',
  DailyReportSchema,
  'DailyReport'
);

const CurrResSch = mongoose.model(
  'Reservation',
  ReservationSchema,
  'CurrentReservation'
);

/**
 * Logic To Perform Querys Against DailyReport Collection in MongoDB
 */
class DailyReport {
  constructor(RoomNum) {
    this.RoomNum = RoomNum;
    this.ReservationReport = 'Room';
    this.HouseKeepingReport = 'HouseKeeping';
  }

  /**
   * Returns the Report matching with the Date args
   *
   * @param {Date} date The date of the matching report
   */
  static getReport(date) {
    const result = DailyReportSch.findOne({ Date: date }).select('-_id').lean();
    if (!result) throw new Error('Report Does Not Exist');
    return result;
  }

  /**
   * Inserts a Report Object into DailyReport Collection
   *
   * @param {Object} reportObj
   */
  static insertReport(reportObj) {
    const Report = new DailyReportSch(reportObj);
    return Report.save();
  }

  /**
   * Updates a record in the daily report given the date of the
   * report and the RoomID as well as the matching record in
   * Current Reservations
   *
   * @param {Object} updatedGuest  the updated guest information
   * @param {Number} roomid    the roomid of the guest
   * @param {Date} date      the date of the report to be updated
   */
  async updateGuestRecord(updatedGuest, date) {
    debug(updatedGuest);

    const updatedRec = { $set: {} };
    updatedRec.$set[
      `Stays.${updatedGuest.RoomID}.${this.ReservationReport}`
    ] = updatedGuest;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const originalRes = await CurrResSch.findOne({
        BookingID: updatedGuest.BookingID,
      })
        .select('-_id -__v')
        .lean();

      if (!originalRes) throw new Error('Cannot Update Checked Out Guest');

      const originalRep = await DailyReportSch.findOne({ Date: date })
        .select('-_id -__v')
        .lean()
        .session(session);

      if (!originalRep) throw new Error('Report Does Not Exist');

      const originalRec =
        originalRep.Stays[`${originalRes.RoomID}`][`${this.ReservationReport}`];

      await DailyReportSch.findOneAndUpdate({ Date: date }, updatedRec).session(
        session
      );

      // guest has decided/paid to stayover
      if (!originalRec.endDate) {
        originalRes.pricePaid =
          parseFloat(originalRes.pricePaid) + parseFloat(updatedGuest.rate);
        originalRes.tax =
          parseFloat(originalRes.tax) + parseFloat(updatedGuest.tax);
        originalRes.checkOut = moment(
          moment(updatedGuest.endDate).add(1, 'days')
        ).format('YYYY-MM-DDT12:00:00[Z]');
      } else {
        // simple update for the guest record with reflecting changes in reservation storied in CurrentReservation
        originalRes.pricePaid +=
          updatedGuest.rate - parseFloat(originalRec.rate);

        originalRes.tax += updatedGuest.tax - parseFloat(originalRec.tax);

        originalRes.checkIn = moment(updatedGuest.startDate).format(
          'YYYY-MM-DDT12:00:00[Z]'
        );
        originalRes.checkOut = moment(
          moment(updatedGuest.endDate).add(1, 'days')
        ).format('YYYY-MM-DDT12:00:00[Z]');
      }

      await CurrResSch.findOneAndUpdate(
        { BookingID: updatedGuest.BookingID },
        originalRes
      ).session(session);

      await session.commitTransaction();
      return originalRes;
    } catch (err) {
      debug(err);
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  /**
   * Updates the Record Record in a Given DailyReport Document
   *
   * @param {Date} date The Date of the Document
   * @param {Number} num The Refund Amount
   * @param {*} notes Any Additional Comments Regarding the Refund Amount for the Document
   */
  static async updateRefund(date, num, notes) {
    debug(date);
    debug(num);
    debug(notes);
    const updatedRefund = { $set: {} };
    updatedRefund.$set['Refund.Amount'] = num;
    updatedRefund.$set['Refund.Notes'] = notes;

    const newReport = await DailyReportSch.findOneAndUpdate(
      { Date: date },
      updatedRefund
    ).lean();

    if (!newReport) throw new Error('Report is Not Defined');
    return newReport;
  }

  /**
   * Uses the given data to generate a a daily report object
   *
   * @param {Date} endDate: the previous date of the report
   * @param {Date} newDate: the date of the report
   * @param {Object} stays: the previous day's stays
   *
   * @return A DailyReport Object
   */
  generateDailyReport(endDate, newDate, stays) {
    let i;
    const StaySchema = {};
    for (i = 101; i <= 100 + this.RoomNum; i++) {
      let newReport;
      let houseKeeperReport;
      /**
       * The three options are;
       * 1) Guest exists and is not yet due
       * 2) Guest exists and is due
       * 3) Guest does not exist
       */
      if (stays[`${i}`] && stays[`${i}`][this.ReservationReport].BookingID) {
        if (
          !stays[`${i}`][this.ReservationReport].endDate ||
          moment(stays[`${i}`][this.ReservationReport].endDate).isSameOrBefore(
            endDate,
            'day'
          )
        ) {
          newReport = {
            BookingID: stays[`${i}`][this.ReservationReport].BookingID,
            type: stays[`${i}`][this.ReservationReport].type,
            payment: '',
            startDate: newDate,
            endDate: '',
            paid: false,
            rate: 0,
            tax: 0,
            initial: '',
          };
          houseKeeperReport = {
            status: stays[`${i}`][this.HouseKeepingReport].status,
            type: stays[`${i}`][this.HouseKeepingReport].type,
            houseKeeper: '',
            notes: stays[`${i}`][this.HouseKeepingReport].notes,
          };
        } else {
          newReport = {
            BookingID: stays[`${i}`][this.ReservationReport].BookingID,
            type: stays[`${i}`][this.ReservationReport].type,
            payment: '',
            startDate: stays[`${i}`][this.ReservationReport].startDate,
            endDate: stays[`${i}`][this.ReservationReport].endDate,
            paid: stays[`${i}`][this.ReservationReport].paid,
            rate: 0,
            tax: 0,
            initial: '',
          };
          houseKeeperReport = {
            status: 'O',
            type: stays[`${i}`][this.HouseKeepingReport].type,
            houseKeeper: '',
            notes: stays[`${i}`][this.HouseKeepingReport].notes,
          };
        }
      } else {
        newReport = {};
        houseKeeperReport = {
          status: stays[`${i}`]
            ? stays[`${i}`][this.HouseKeepingReport].status
            : 'R',
          type: stays[`${i}`]
            ? stays[`${i}`][this.HouseKeepingReport].type
            : 'S',
          houseKeeper: '',
          notes: '',
        };
      }

      StaySchema[`${i}`] = { Room: {}, HouseKeeping: {} };
      StaySchema[`${i}`][this.ReservationReport] = newReport;
      StaySchema[`${i}`][this.HouseKeepingReport] = houseKeeperReport;
    }

    return {
      YearID: moment(newDate).format('YYYY'),
      MonthID: moment(newDate).format('MM'),
      Date: newDate,
      Refund: {
        Amount: 0,
        Notes: '',
      },
      Stays: StaySchema,
    };
  }
}

module.exports = DailyReport;

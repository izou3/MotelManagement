const mongoose = require('mongoose');
const moment = require('moment');

const Report = require('./index');
const DailyReportModel = require('../../../models/DailyReport');

class DailyReport extends Report {
  /**
   * Creates New Instance to connect to DailyReport Collection in Mongo
   * @param {Number} HotelID
   * @returns New instance to reference DailyReport Collection
   */
  constructor(HotelID) {
    super(HotelID);
    switch (HotelID) {
      case DailyReport.getLazyUID: {
        this._connection = mongoose.model(
          'DailyReport',
          DailyReportModel,
          'LazyU_DailyReport'
        );
        this._HotelID = DailyReport.getLazyUID;
        break;
      }
      case DailyReport.getFairValueID: {
        this._connection = mongoose.model(
          'DailyReport',
          DailyReportModel,
          'FairValue_DailyReport'
        );
        this._HotelID = DailyReport.getFairValueID;
        break;
      }
      default: {
        this._HotelID = null;
        this._connection = null;
      }
    }
    this._HouseKeepingRecord = 'HouseKeeping';
    this._ReservationRecord = 'Room';
  }

  /**
   * @returns The Housekeeping Record keyword of a DailyReport Object
   */
  get HouseKeepingRecord() {
    return this._HouseKeepingRecord;
  }

  /**
   * @returns The Room Record keyword of a DailyReport Object
   */
  get ReservationRecord() {
    return this._ReservationRecord;
  }

  /**
   * Update whole record of Room and Housekeeping Record for a Room Number
   * @param {Date} date Date of Report
   * @param {Number} RoomID The Room to be changed
   * @param {Object} updatedGuestRoomRecord Room Record
   * @param {Object} updatedGuestHousekeepingRecord Housekeeping Record
   * @param {Boolean} isNewReport Whether Report Returned Should be original or new report obj
   * @param {Object} session
   * @returns New/Original Report Object
   */
  updateGuestRecord(
    date,
    RoomID,
    updatedGuestRoomRecord,
    updatedGuestHouseKeepingRecord,
    isNewReport = true,
    session = null
  ) {
    const updatedRecord = { $set: {} };
    updatedRecord.$set[
      `Stays.${RoomID}.${this._ReservationRecord}`
    ] = updatedGuestRoomRecord;

    updatedRecord.$set[
      `Stays.${RoomID}.${this._HouseKeepingRecord}`
    ] = updatedGuestHouseKeepingRecord;

    if (session) {
      return this._connection
        .findOneAndUpdate({ Date: date }, updatedRecord, { new: isNewReport })
        .session(session);
    }
    return this._connection.findOneAndUpdate({ Date: date }, updatedRecord);
  }

  /**
   * Update whole record of Room and only room status field of Housekeeping Record for a Room Number
   * @param {Date} date Date of Report
   * @param {Number} RoomID The Room to be changed
   * @param {Object} updatedGuestRoomRecord Room Record
   * @param {Object} roomStatus Room Status Field of Housekeeping Record
   * @param {Boolean} isNewReport Whether Report Returned Should be original or new report obj
   * @param {Object} session
   * @returns New/Original Report Object
   */
  updateGuestRecordWithRoomStatus(
    date,
    RoomID,
    updatedGuestRoomRecord,
    roomStatus,
    isNewReport = true,
    session = null
  ) {
    const updatedRecord = { $set: {} };
    updatedRecord.$set[
      `Stays.${RoomID}.${this._ReservationRecord}`
    ] = updatedGuestRoomRecord;

    updatedRecord.$set[
      `Stays.${RoomID}.${this._HouseKeepingRecord}.status`
    ] = roomStatus;

    if (session) {
      return this._connection
        .findOneAndUpdate({ Date: date }, updatedRecord, { new: isNewReport })
        .session(session);
    }
    return this._connection.findOneAndUpdate({ Date: date }, updatedRecord);
  }

  /**
   * Update Room Record of Given RoomID and Date of Report
   * @param {Date} date Date of Report
   * @param {Number} RoomID
   * @param {Object} updatedRoomRecord Room Record
   * @param {Boolean} isNewReport Whether Report Returned Should be original or new report obj
   * @param {Object} session
   * @returns New/Original Report Object
   */
  updateGuestRoomRecord(
    date,
    RoomID,
    updatedRoomRecord,
    isNewReport = true,
    session = null
  ) {
    const updatedRecord = { $set: {} };
    updatedRecord.$set[
      `Stays.${RoomID}.${this._ReservationRecord}`
    ] = updatedRoomRecord;

    if (session) {
      return this._connection
        .findOneAndUpdate({ Date: date }, updatedRecord, { new: isNewReport })
        .session(session);
    }
    return this._connection.findOneAndUpdate({ Date: date }, updatedRecord);
  }

  /**
   * Update Full Housekeeping Record of Given RoomID and Date of Report
   * @param {Date} date Date of Report
   * @param {Number} RoomID
   * @param {Object} updatedRoomRecord Housekeeping Record
   * @param {Boolean} isNewReport Whether Report Returned Should be original or new report obj
   * @param {Object} session
   * @returns New/Original Report Object
   */
  updateGuestHousekeepingRecord(
    date,
    RoomID,
    updatedHouseKeepingRecord,
    isNewReport = true,
    session = null
  ) {
    const updatedRecord = { $set: {} };
    updatedRecord.$set[
      `Stays.${RoomID}.${this._HouseKeepingRecord}`
    ] = updatedHouseKeepingRecord;

    if (session) {
      return this._connection
        .findOneAndUpdate({ Date: date }, updatedRecord, { new: isNewReport })
        .session(session);
    }
    return this._connection.findOneAndUpdate({ Date: date }, updatedRecord, {
      new: isNewReport,
    });
  }

  /**
   * Update only status field of housekeeping record
   * @param {Date} date Date of Report
   * @param {Number} RoomID
   * @param {Object} roomStatus Room Status of Housekeeping Record
   * @param {Boolean} isNewReport Whether Report Returned Should be original or new report obj
   * @param {Object} session
   * @returns New/Original Report Object
   */
  updateGuestHousekeepingRecordWithRoomStatus(
    date,
    RoomID,
    roomStatus,
    isNewReport = true,
    session = null
  ) {
    const updatedRecord = { $set: {} };
    updatedRecord.$set[
      `Stays.${RoomID}.${this._HouseKeepingRecord}.status`
    ] = roomStatus;

    if (session) {
      return this._connection
        .findOneAndUpdate({ Date: date }, updatedRecord, { new: isNewReport })
        .session(session);
    }
    return this._connection.findOneAndUpdate({ Date: date }, updatedRecord, {
      new: isNewReport,
    });
  }

  /**
   * Updates the Record Record in a Given DailyReport Document
   *
   * @param {Date} date The Date of the Document
   * @param {Number} num The Refund Amount
   * @param {String} notes Any Additional Comments Regarding the Refund Amount for the Document
   * @param {Boolean} isNewReport Whether Report Returned Should be original or new report obj
   *
   * @returns New/Original Report Object
   */
  updateRefund(date, amount, notes, isNewReport = true) {
    const updatedRefund = { $set: {} };
    updatedRefund.$set['Refund.Amount'] = amount || 0;
    updatedRefund.$set['Refund.Notes'] = notes || '';

    return this._connection
      .findOneAndUpdate({ Date: date }, updatedRefund, { new: isNewReport })
      .lean();
  }

  /**
   * Uses the given data to generate a a daily report object
   *
   * @param {Date} endDate: the previous date of the report
   * @param {Date} newDate: the date of the report
   * @param {Object} stays: the previous day's Stays Object
   *
   * @return A DailyReport Object
   */
  generateDailyReport(endDate, startDate, stays) {
    let i;
    const StaySchema = {};

    for (i = 101; i <= 100 + DailyReport.getRoomNum + 4; i++) {
      let newReport;
      let houseKeeperReport;
      /**
       * The three options are;
       * 1) Guest exists and is not yet due
       * 2) Guest exists and is due
       * 3) Guest does not exist
       */
      if (stays[`${i}`] && stays[`${i}`][this._ReservationRecord].BookingID) {
        if (
          !stays[`${i}`][this._ReservationRecord].endDate ||
          moment(stays[`${i}`][this._ReservationRecord].endDate).isSameOrBefore(
            endDate,
            'day'
          )
        ) {
          // Guest is Due
          newReport = {
            BookingID: stays[`${i}`][this._ReservationRecord].BookingID,
            type: stays[`${i}`][this._ReservationRecord].type,
            payment: '',
            startDate: moment(startDate).format('YYYY-MM-DDT12:00:00[Z]'),
            endDate: '',
            paid: false,
            rate: 0,
            tax: 0,
            notes: stays[`${i}`][this._ReservationRecord].notes || '',
            initial: '',
          };

          houseKeeperReport = {
            status: stays[`${i}`]
              ? stays[`${i}`][this._HouseKeepingRecord].status
              : 'O',
            type: stays[`${i}`]
              ? stays[`${i}`][this._HouseKeepingRecord].type
              : 'S',
            houseKeeper: '',
            notes: stays[`${i}`]
              ? stays[`${i}`][this._HouseKeepingRecord].notes
              : '',
          };
        } else {
          // Guest is Not Yet Due
          newReport = {
            BookingID: stays[`${i}`][this._ReservationRecord].BookingID,
            type: stays[`${i}`][this._ReservationRecord].type,
            payment: '',
            startDate: stays[`${i}`][this._ReservationRecord].startDate,
            endDate: stays[`${i}`][this._ReservationRecord].endDate,
            paid: stays[`${i}`][this._ReservationRecord].paid,
            rate: 0,
            tax: 0,
            notes: stays[`${i}`][this._ReservationRecord].notes || '',
            initial: '',
          };
          houseKeeperReport = {
            status: stays[`${i}`]
              ? stays[`${i}`][this._HouseKeepingRecord].status
              : 'O',
            type: stays[`${i}`]
              ? stays[`${i}`][this._HouseKeepingRecord].type
              : 'S',
            houseKeeper: '',
            notes: stays[`${i}`]
              ? stays[`${i}`][this._HouseKeepingRecord].notes
              : '',
          };
        }
      } else {
        newReport = {};
        houseKeeperReport = {
          status: stays[`${i}`]
            ? stays[`${i}`][this._HouseKeepingRecord].status
            : 'R',
          type: stays[`${i}`]
            ? stays[`${i}`][this._HouseKeepingRecord].type
            : 'S',
          houseKeeper: '',
          notes: '',
        };
      }

      StaySchema[`${i}`] = { Room: {}, HouseKeeping: {} };
      StaySchema[`${i}`][this._ReservationRecord] = newReport;
      StaySchema[`${i}`][this._HouseKeepingRecord] = houseKeeperReport;
    }

    return {
      HotelID: this._HotelID,
      YearID: moment(startDate).format('YYYY'),
      MonthID: moment(startDate).format('MM'),
      Date: startDate,
      Refund: {
        Amount: 0,
        Notes: '',
      },
      Stays: StaySchema,
    };
  }
}

module.exports = DailyReport;

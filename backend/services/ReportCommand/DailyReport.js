const mongoose = require('mongoose');
const moment = require('moment');

const TaxReportClass = require('../../lib/data-access/ReportClass/TaxReport');
const DailyReportClass = require('../../lib/data-access/ReportClass/DailyReport');
const CurrentReservationClass = require('../../lib/data-access/ReservationClass/CurrentReservation');

class SearchDailyReport {
  constructor(date) {
    this._date = date;
  }

  async execute(HotelID) {
    const DailyReport = new DailyReportClass(HotelID);

    const query = { Date: this._date };

    const result = await DailyReport.getReport(query);
    if (!result) throw new Error('Report Does Not Exist');
    return result;
  }
}

class UpdateDailyReportRoomRecord {
  constructor(date, newRoomRecord) {
    this._date = date;
    this._NewRoomRecord = newRoomRecord;
  }

  async execute(HotelID) {
    const DailyReport = new DailyReportClass(HotelID);
    const CurrentReservation = new CurrentReservationClass(HotelID);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      /**
       * @NOTE there can be hypotetical case in which a guest who has a previous record in
       * the DailyReport (any DailyReport before current day) who is moved to arrivals instead
       * of being checked-out. And on another day, is checked back in and the user tries to edit
       * the previous record of DailyReport of the guest's old room in which the below query will
       * search for the BookingID and Checked as they exist in another room of the current DailyReport
       * record. This will cause some errors in the frontend can be resolved by refreshing 'ish'.
       *    For example, if a guest has a record on 10/20 in Rm107, and today is 10/21, and that guest is moved
       *    to arrivals and then moved back into Current to Rm105 and a user tries to edit the DailyReport
       *    for 10/20 for Rm 107, then frontend will create another Rm107 record for the time being until refreshed
       *
       * HOWEVER, this situation is not pratical as a user wouldn't edit a previous DailyReport record
       * of a room that has moved to Arrivals after being checked in, and then checked back in
       * (rare situation firstoff)
       */
      // Find By ID and Checked = 1 to make sure guest is still residing at motel
      const originalRes = await CurrentReservation.getReservationByIDWithCheckField(
        this._NewRoomRecord.BookingID,
        1
      );

      if (!originalRes) throw new Error('Cannot Update Checked Out Guest');

      const originalRep = await DailyReport.getReport({ Date: this._date });

      if (!originalRep) throw new Error('Report Does Not Exist');

      const originalRec =
        originalRep.Stays[`${originalRes.RoomID}`][
          `${DailyReport.ReservationRecord}`
        ];

      const UpdatedGuestRoomRecord = await DailyReport.updateGuestRoomRecord(
        this._date,
        this._NewRoomRecord.RoomID,
        this._NewRoomRecord,
        true,
        session
      );

      if (!UpdatedGuestRoomRecord)
        throw new Error('Failed to Update Room Record');

      // guest has decided/paid to stayover
      if (!originalRec.endDate) {
        originalRes.pricePaid =
          parseFloat(originalRes.pricePaid) +
          parseFloat(this._NewRoomRecord.rate);
        originalRes.tax =
          parseFloat(originalRes.tax) + parseFloat(this._NewRoomRecord.tax);
        // checkIn Does Not Change
        originalRes.checkOut = moment(
          moment.utc(this._NewRoomRecord.endDate).add(1, 'days')
        ).format('YYYY-MM-DDT12:00:00[Z]');
      } else {
        // simple update for the guest record with reflecting changes in reservation storied in CurrentReservation
        originalRes.pricePaid +=
          this._NewRoomRecord.rate - parseFloat(originalRec.rate);

        originalRes.tax +=
          this._NewRoomRecord.tax - parseFloat(originalRec.tax);

        // checkIn Does Not Change in Document in CurrentReservation
        // originalRes.checkIn = moment(this._NewRoomRecord.startDate).format(
        //   'YYYY-MM-DDT12:00:00[Z]'
        // );
        originalRes.checkOut = moment(
          moment.utc(this._NewRoomRecord.endDate).add(1, 'days')
        ).format('YYYY-MM-DDT12:00:00[Z]');
      }

      originalRes.pricePaid =
        Math.round((originalRes.pricePaid + Number.EPSILON) * 100) / 100;

      originalRes.tax =
        Math.round((originalRes.tax + Number.EPSILON) * 100) / 100;

      const UpdatedCurrent = await CurrentReservation.updateReservation(
        originalRes,
        session,
        true
      );

      if (!UpdatedCurrent) throw new Error('Failed to Update Reservation');

      await session.commitTransaction();
      return originalRes;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}

class UpdateDailyReportRefund {
  constructor(date, amount, notes) {
    this._date = date;
    this._amount = amount;
    this._notes = notes;
  }

  async execute(HotelID) {
    const DailyReport = new DailyReportClass(HotelID);

    const newReport = await DailyReport.updateRefund(
      this._date,
      this._amount,
      this._notes,
      true
    );

    if (!newReport) throw new Error('Report is Not Defined');
    return newReport;
  }
}

/**
 * PLEASE NOTE THE FOLLOWING DEFICIENCIES
 *  1. On CheckOut Ops in Current Reservation Collection, if the room number
 *     is altered on action button, the houseKeeping Record will react correspondingly
 *     to the altered room number and not the room that guest was staying in before.
 *     This can be solved by sending an update request prior to the checkout or
 *     hard-coding an additional query in checkOut() in Customer Service to obtain the
 *     the previously stored info.
 */
class UpdateDailyReportHousekeepingRecord {
  constructor(date, newHouseKeepingRecord) {
    this._date = date;
    this._NewHouseKeepingRecord = newHouseKeepingRecord;
  }

  async execute(HotelID) {
    const DailyReport = new DailyReportClass(HotelID);

    const result = await DailyReport.updateGuestHousekeepingRecord(
      this._date,
      this._NewHouseKeepingRecord.RoomID,
      this._NewHouseKeepingRecord,
      true,
      null
    );

    if (!result) throw new Error('HouseKeeping Record Does Not Exist');
    return result;
  }
}

class GenerateTaxReport {
  constructor(MonthID, YearID) {
    this._YearID = YearID;
    this._MonthID = MonthID;
  }

  async execute(HotelID) {
    const TaxReport = new TaxReportClass(HotelID, this._YearID, this._MonthID);

    const TaxReportArr = await TaxReport.generateTaxReport();

    const date = moment().format('MM-YYYY');
    const fileName = `TaxReport_${date}.csv`;

    const data = TaxReportArr[0].FinalReport;
    const csv = TaxReport.downloadTaxReport(data);

    return {
      fileName,
      csv,
    };
  }
}

module.exports = {
  SearchDailyReport,
  UpdateDailyReportRoomRecord,
  UpdateDailyReportRefund,
  UpdateDailyReportHousekeepingRecord,
  GenerateTaxReport,
};

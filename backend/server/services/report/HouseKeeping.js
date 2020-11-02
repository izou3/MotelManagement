/**
 * Module Dependencies
 */
const mongoose = require('mongoose');
const debug = require('debug')('motel:http');
const DailyReportSchema = require('../../models/DailyReport');

// Mongose Schema Model
const DailyReportSch = mongoose.model(
  'DailyReport',
  DailyReportSchema,
  'DailyReport'
);

/**
 * Class for Tracking the HouseKeeping Schema of the Daily Report Collection
 *
 * PLEASE NOTE THE FOLLOWING DEFICIENCIES
 *  1. On Updates/CheckIn/CheckOut Ops in CurrentReservation Collection,
 *     only roomType is preserved and altered accordingly. The houseKeeper
 *     and notes of the houseKeeping room record is erased. This can be solved
 *     by coding them into the query params per request after obtaining from
 *     frontend state.
 *  2. On CheckOut Ops in Current Reservation Collection, if the room number
 *     is altered on action button, the houseKeeping Record will react correspondingly
 *     to the altered room number and not the room that guest was staying in behand.
 *     This can be solved by sending an update request prior to the checkout or
 *     hard-coding an additional query in checkOut() in Customer Service to obtain the
 *     the previously stored info.
 */
class HouseKeepingReport {
  constructor() {
    this.HouseKeepingReport = 'HouseKeeping';
  }

  /**
   * Updates a HouseKeeping Record in Report Schema
   * @param {*} updatedRecord
   * @param {*} date
   */
  async updateHouseKeepingRecord(updatedRecord, date) {
    const updatedRec = { $set: {} };
    updatedRec.$set[
      `Stays.${updatedRecord.RoomID}.${this.HouseKeepingReport}`
    ] = updatedRecord;

    const result = await DailyReportSch.findOneAndUpdate(
      { Date: date },
      updatedRec,
      { new: true }
    )
      .select('-_id -__v')
      .lean();

    if (!result) throw new Error('HouseKeeping Record Does Not Exist');
    return result;
  }
}

module.exports = HouseKeepingReport;

const Motel = require('../Motel');

class Report extends Motel {
  /**
   * Returns the Current Connection to DailyReport Collection
   */
  get getConnection() {
    return this._connection;
  }

  /**
   * Returns Report Based on Query Condition
   * @param {Object} query
   * @returns Report Object with Matching Query
   */
  getReport(query) {
    return this._connection
      .findOne(query)
      .select('-__v -_id -created_date -Name -HotelID -126') // Rid of Rm 126 from Maintenance Sheets
      .lean();
  }

  /**
   * Add ReportObject to Collection
   * @param {Object} reportObj
   * @returns Newly Added Report Object
   */
  insertReport(reportObj, session = null) {
    if (session) {
      return this._connection.create([reportObj], { session });
    }
    return this._connection.create([reportObj]);
  }
}

module.exports = Report;

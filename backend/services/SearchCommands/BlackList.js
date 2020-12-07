const BlackListClass = require('../../lib/data-access/CustomerClass/BlackList');

class SearchBlackListByFirstName {
  constructor(firstName, SQLPool) {
    this.pool = SQLPool;
    this._firstName = firstName;
  }

  async execute(HotelID) {
    const BlackList = new BlackListClass(HotelID);

    const result = await this.pool.query(
      BlackList.getBlacklistCustomerByFirstName(this._firstName)
    );

    if (result[0].length === 0) {
      throw new Error('Failed to Find Match');
    }
    return result[0];
  }
}

class SearchBlackListByBookingID {
  constructor(BookingID, SQLPool) {
    this.pool = SQLPool;
    this._BookingID = BookingID;
  }

  async execute(HotelID) {
    const BlackList = new BlackListClass(HotelID);

    const result = await this.pool.query(
      BlackList.getBlacklistCustomerByBookingID(this._BookingID)
    );

    if (result[0].length === 0) {
      throw new Error('Failed to Find Match');
    }
    return result[0];
  }
}

module.exports = { SearchBlackListByBookingID, SearchBlackListByFirstName };

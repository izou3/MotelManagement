const BlackListClass = require('../../lib/data-access/CustomerClass/BlackList');

class CreateNewBlackListCust {
  constructor(BookingID, Comments, sqlPool) {
    this._BookingID = BookingID;
    this._Comments = Comments;
    this._pool = sqlPool;
  }

  async execute(HotelID) {
    const BlackList = new BlackListClass(HotelID);

    const result = await this._pool.query(
      BlackList.addBlacklistCustomer(this._BookingID, this._Comments)
    );

    if (result[0].affectedRows === 0) {
      throw new Error('Failed to Add Customer');
    }
    // SQL Doesn't Return Newly Added Data
    return result;
  }
}

class UpdateBlackListCust {
  constructor(BookingID, Comments, sqlPool) {
    this._BookingID = BookingID;
    this._Comments = Comments;
    this._pool = sqlPool;
  }

  async execute(HotelID) {
    const BlackList = new BlackListClass(HotelID);
    const result = await this._pool.query(
      BlackList.updateBlacklistCustomer(this._BookingID, this._Comments)
    );

    if (result[0].affectedRows === 0) {
      throw new Error('Customer Does Not Exist in BlackList');
    }

    return result;
  }
}

class DeleteBlackListCust {
  constructor(BookingID, sqlPool) {
    this._BookingID = BookingID;
    this._pool = sqlPool;
  }

  async execute(HotelID) {
    const BlackList = new BlackListClass(HotelID);
    const result = await this._pool.query(
      BlackList.deleteBlacklistCustomerByID(this._BookingID)
    );

    if (result[0].affectedRows === 0) {
      throw new Error('Customer Does Not Exist in BlackList');
    }
    return result;
  }
}

module.exports = {
  CreateNewBlackListCust,
  UpdateBlackListCust,
  DeleteBlackListCust,
};

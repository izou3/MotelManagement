const CustomerClass = require('../../lib/data-access/CustomerClass');

class SearchCustomersByName {
  constructor(firstName, SQLPool) {
    this._pool = SQLPool;
    this._firstName = firstName;
  }

  async execute(HotelID) {
    const Customer = new CustomerClass(HotelID);

    const result = await this._pool.query(
      Customer.getIndCustomerByFirstName(this._firstName)
    );

    if (result[0].length === 0) {
      throw new Error('Failed to Find Match');
    }

    return result[0];
  }
}

class SearchCustomersByBookingID {
  constructor(BookingID, SQLPool) {
    this._pool = SQLPool;
    this._BookingID = BookingID;
  }

  /**
   * @param {Number} HotelID HotelID of the Request
   * @returns An array of Matching Documents
   */
  async execute(HotelID) {
    const Customer = new CustomerClass(HotelID);

    const result = await this._pool.query(
      Customer.getIndCustomerByID(this._BookingID)
    );

    if (result[0].length === 0) {
      throw new Error('Failed to Find Match');
    }

    return result[0];
  }
}

class SearchCustomersByCheckIn {
  constructor(startDate, endDate, SQLPool) {
    this._pool = SQLPool;
    this._startDate = startDate;
    this._endDate = endDate;
  }

  async execute(HotelID) {
    const Customer = new CustomerClass(HotelID);

    const result = await this._pool.query(
      Customer.getIndCustomerByCheckIn(this._startDate, this._endDate)
    );

    if (result[0].length === 0) {
      throw new Error('Failed to Find Match');
    }

    return result[0];
  }
}

class SearchCustomersByCheckOut {
  constructor(startDate, endDate, SQLPool) {
    this._pool = SQLPool;
    this._startDate = startDate;
    this._endDate = endDate;
  }

  async execute(HotelID) {
    const Customer = new CustomerClass(HotelID);

    const result = await this._pool.query(
      Customer.getIndCustomerByCheckOut(this._startDate, this._endDate)
    );

    if (result[0].length === 0) {
      throw new Error('Failed to Find Match');
    }

    return result[0];
  }
}

module.exports = {
  SearchCustomersByBookingID,
  SearchCustomersByName,
  SearchCustomersByCheckIn,
  SearchCustomersByCheckOut,
};

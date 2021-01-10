const moment = require('moment');
const BlackListClass = require('../../lib/data-access/CustomerClass/BlackList');
const CustomerClass = require('../../lib/data-access/CustomerClass/index');

/**
 * Add customer to BlackList for a customer who has not stayed at hotel before
 * First Create a Customer and IndCustomer table record and then add that record to
 * BlackList table.
 *
 * If a guest exists (has a customer and indcustomer record) then will just add that
 * record to the blacklist
 *
 * If CustomerID already exists in the BlackList, then will error.
 */
class CreateNewBlackListCustWithNoPrevRec {
  constructor(CustomerObj, sqlPool) {
    this._CustomerObj = CustomerObj;
    this._pool = sqlPool;
  }

  async execute(HotelID) {
    const BlackList = new BlackListClass(HotelID);
    const Customer = new CustomerClass(HotelID);
    const CustomerArr = []; // Data to insert into Customer table
    const IndCustomerArr = []; // Date to insert into IndCustomer Table

    // Create BookingID, CustomerID, etc in order to add to Customer
    const currentTime = moment().format('hhmmssSS');
    const randDig1 = Math.floor(Math.random() * 9) + 1;
    const randDig2 = Math.floor(Math.random() * 9) + 1;
    const MonthID = moment().month() + 1;
    const YearID = moment().year();
    // generate BookingID
    const BookingID = `${randDig2}${currentTime}${randDig1}`;

    // generate CustomerID
    let CustomerID;
    if (this._CustomerObj.lastName.length < 3) {
      let lastNameID;
      for (let i = 0; i < 3 - this._CustomerObj.lastName.length; i++) {
        lastNameID = this._CustomerObj.lastName.concat('x');
      }
      CustomerID =
        lastNameID +
        this._CustomerObj.firstName.substring(0, 1) +
        randDig1 +
        randDig2;
    } else {
      CustomerID =
        this._CustomerObj.lastName.substring(0, 3) +
        this._CustomerObj.firstName.substring(0, 1) +
        randDig1 +
        randDig2;
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      StateID,
      pricePaid,
      tax,
      checkIn,
      checkOut,
      numGuests,
      ReservationID,
      PaymentID,
      RoomID,
      StyleID,
      comments,
    } = this._CustomerObj;

    CustomerArr.push(
      CustomerID,
      YearID,
      MonthID,
      firstName,
      lastName,
      email,
      phone,
      StateID
    );

    IndCustomerArr.push(
      BookingID,
      CustomerID,
      pricePaid,
      tax,
      checkIn,
      checkOut,
      numGuests,
      ReservationID,
      PaymentID,
      RoomID,
      HotelID,
      StyleID,
      comments
    );

    // Begin Process
    const connection = await this._pool.getConnection();
    await connection.beginTransaction();
    try {
      const existingCustomer = await this._pool.query(
        Customer.getAllCustomersByFirstLastName(
          this._CustomerObj.firstName,
          this._CustomerObj.lastName
        )
      );

      let result;
      if (existingCustomer[0].length === 0) {
        // customer does not exist so create a new one
        await connection.query(Customer.addNewCustomer(CustomerArr));
        await connection.query(Customer.addNewIndCustomer(IndCustomerArr));
        result = await connection.query(
          BlackList.addBlacklistCustomer(CustomerID, comments)
        );
      } else {
        /**
         * customer exists already so just add to Blacklist and get
         * existing CustomerID so that it matches up
         */
        const existingCustomerID = existingCustomer[0][0].ID; // Get existing CustomerID

        result = await connection.query(
          BlackList.addBlacklistCustomer(existingCustomerID, comments)
        );
      }

      if (result[0].affectedRows === 0) {
        throw new Error('Failed to Add Customer');
      }
      // SQL Doesn't Return Newly Added Data
      await connection.commit();
      return result;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      await connection.release();
    }
  }
}

class CreateNewBlackListCust {
  constructor(CustomerID, Comments, sqlPool) {
    this._CustomerID = CustomerID;
    this._Comments = Comments;
    this._pool = sqlPool;
  }

  async execute(HotelID) {
    const BlackList = new BlackListClass(HotelID);

    const result = await this._pool.query(
      BlackList.addBlacklistCustomer(this._CustomerID, this._Comments)
    );

    if (result[0].affectedRows === 0) {
      throw new Error('Failed to Add Customer');
    }
    // SQL Doesn't Return Newly Added Data
    return result;
  }
}

class UpdateBlackListCust {
  constructor(CustomerID, Comments, sqlPool) {
    this._CustomerID = CustomerID;
    this._Comments = Comments;
    this._pool = sqlPool;
  }

  async execute(HotelID) {
    const BlackList = new BlackListClass(HotelID);
    const result = await this._pool.query(
      BlackList.updateBlacklistCustomer(this._CustomerID, this._Comments)
    );

    if (result[0].affectedRows === 0) {
      throw new Error('Customer Does Not Exist in BlackList');
    }

    return result;
  }
}

class DeleteBlackListCust {
  constructor(CustomerID, sqlPool) {
    this._CustomerID = CustomerID;
    this._pool = sqlPool;
  }

  async execute(HotelID) {
    const BlackList = new BlackListClass(HotelID);
    const result = await this._pool.query(
      BlackList.deleteBlacklistCustomerByID(this._CustomerID)
    );

    if (result[0].affectedRows === 0) {
      throw new Error('Customer Does Not Exist in BlackList');
    }
    return result;
  }
}

module.exports = {
  CreateNewBlackListCustWithNoPrevRec,
  CreateNewBlackListCust,
  UpdateBlackListCust,
  DeleteBlackListCust,
};

const moment = require('moment');
const mongoose = require('mongoose');

const CustomerClass = require('../../lib/data-access/CustomerClass/index');
const CurrentReservationClass = require('../../lib/data-access/ReservationClass/CurrentReservation');
const DailyReportClass = require('../../lib/data-access/ReportClass/DailyReport');

const CheckOutCurrentReservation = async (
  BookingID,
  date,
  roomType,
  HotelID
) => {
  const Current = new CurrentReservationClass(HotelID);
  const DailyReport = new DailyReportClass(HotelID);

  const session = await mongoose.startSession();
  session.startTransaction();

  const UpdatedResult = { PrevResObj: undefined, UpdatedReport: {} };
  try {
    // get the previous RoomID in case that on checkOut, the RoomID was changed
    const prevRoomObj = await Current.deleteReservation(BookingID, session);

    if (!prevRoomObj) throw new Error('Reservation Does Not Exist');

    UpdatedResult.PrevResObj = prevRoomObj;

    const updatedRoomRecord = {};
    const updatedHouseKeepingRecord = {
      status: 'C',
      type: roomType || 'W',
      houseKeeper: '',
      notes: '',
    };

    const UpdatedReport = await DailyReport.updateGuestRecord(
      date,
      prevRoomObj.RoomID,
      updatedRoomRecord,
      updatedHouseKeepingRecord,
      true,
      session
    );

    if (!UpdatedReport) throw new Error('Daily Report Does Not Exist');
    UpdatedResult.UpdatedReport = UpdatedReport;

    await session.commitTransaction();
    return UpdatedResult;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

class CreateNewCustomer {
  constructor(newCustObj, roomType, SQLPool) {
    this._newCustObj = newCustObj;
    this._roomType = roomType;
    this._pool = SQLPool;
  }

  async execute(_HotelID) {
    const date = moment().format('YYYY-MM-DD');
    const Customer = new CustomerClass(_HotelID);
    const CustomerArr = [];
    const IndCustomerArr = [];

    const {
      CustomerID,
      YearID,
      MonthID,
      firstName,
      lastName,
      email,
      phone,
      StateID,
      BookingID,
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
      comments,
    } = this._newCustObj;

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
        Customer.getAllCustomersByFirstLastName(firstName, lastName)
      );
      if (existingCustomer[0].length === 0) {
        // customer does not exist so create a new one
        await connection.query(Customer.addNewCustomer(CustomerArr));
        await connection.query(Customer.addNewIndCustomer(IndCustomerArr));
      } else {
        /**
         * customer exists already so add onto their stays and
         * change CustomerID so that it matches up
         */
        const existingCustomerID = existingCustomer[0][0].ID; // Get existing CustomerID

        IndCustomerArr[1] = existingCustomerID; // Change CustomerID

        await connection.query(Customer.addNewIndCustomer(IndCustomerArr));
      }

      // As guest has checked out so Remove Reservation from Current and DailyReport Collection
      const UpdatedReport = await CheckOutCurrentReservation(
        BookingID,
        date,
        this._roomType,
        _HotelID
      );

      await connection.commit();
      return UpdatedReport;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      await connection.release();
    }
  }
}

class UpdateCustomer {
  constructor(updatedCustObj, SQLPool) {
    this._updatedCustObj = updatedCustObj;
    this._pool = SQLPool;
  }

  async execute(_HotelID) {
    const Customer = new CustomerClass(_HotelID);
    const CustomerArr = [];
    const IndCustomerArr = [];
    const {
      CustomerID,
      firstName,
      lastName,
      email,
      phone,
      StateID,
      BookingID,
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
      comments,
    } = this._updatedCustObj;

    CustomerArr.push(firstName, lastName, email, phone, StateID);

    IndCustomerArr.push(
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

    const connection = await this._pool.getConnection();
    try {
      await connection.beginTransaction();

      const result1 = await connection.query(
        Customer.updateCustomerByID(CustomerID, CustomerArr)
      );
      const result2 = await connection.query(
        Customer.updateIndCustomerByID(BookingID, IndCustomerArr)
      );

      if (result1[0].affectedRows === 0 || result2[0].affectedRows === 0) {
        throw new Error('Failed to Update with Undefined ID');
      }

      await connection.commit();
      return {
        ...this._updatedCustObj,
        Checked: undefined,
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      await connection.release();
    }
  }
}

module.exports = { CreateNewCustomer, UpdateCustomer };

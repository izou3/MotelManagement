const mongoose = require('mongoose');
const moment = require('moment');

const EmailEvent = require('../../subscribers/EmailEvent');

const CurrentReservationClass = require('../../lib/data-access/ReservationClass/CurrentReservation');
const PendingReservationClass = require('../../lib/data-access/ReservationClass/PendingReservation');
const DeleteReservationClass = require('../../lib/data-access/ReservationClass/DeleteReservation');
const DailyReportClass = require('../../lib/data-access/ReportClass/DailyReport');

const SetTypeAndPayment = (today, checkIn, checkOut, PaymentID) => {
  // Set Type and Payment Fields of DailyReport Based on new reservation object
  let payment;

  switch (PaymentID) {
    case 0: {
      payment = 'CC';
      break;
    }
    case 1: {
      payment = 'C';
      break;
    }
    default: {
      payment = '';
    }
  }

  let type;
  const resCheckOut = moment(checkOut);
  const oneWeek = moment(moment(checkIn).add(7, 'day')).format('YYYY-MM-DD');
  const twoWeek = moment(moment(checkIn).add(14, 'day')).format('YYYY-MM-DD');
  const threeWeek = moment(moment(checkIn).add(21, 'day')).format('YYYY-MM-DD');
  const noWeek = moment(moment(checkIn).add(28, 'day')).format('YYYY-MM-DD');
  if (resCheckOut.isBetween(checkIn, oneWeek)) {
    // Either N or S/O
    if (moment(resCheckOut.subtract(1, 'day')).isSame(checkIn, 'day')) {
      type = 'N';
    } else {
      type = 'S/O';
    }
  } else if (resCheckOut.isBetween(oneWeek, twoWeek)) {
    // WKI
    type = 'WK1';
  } else if (resCheckOut.isBetween(twoWeek, threeWeek)) {
    // WK2
    type = 'WK2';
  } else if (resCheckOut.isBetween(threeWeek, noWeek)) {
    // WK3
    type = 'WK3';
  } else {
    // NO
    type = 'NO';
  }

  return {
    payment,
    type,
  };
};

class SearchAllCurrRes {
  constructor(HotelID) {
    this._HotelID = HotelID;
  }

  async execute(HotelID) {
    const CurrentReservation = new CurrentReservationClass(this._HotelID);
    const result = await CurrentReservation.getAllReservations();
    // No Need to Check for empty Array
    return result;
  }
}

class CreateCurrRes {
  constructor(newResObj) {
    this._NewResObj = newResObj;
  }

  async execute(HotelID) {
    const today = moment().format('YYYY-MM-DD');
    const CurrentReservation = new CurrentReservationClass(HotelID);

    // Guest has not checked in yet so is not in the DailyReport
    if (this._NewResObj.Checked === 2) {
      const result = await CurrentReservation.createOneNewReservation(
        this._NewResObj
      );

      if (!result || result.length === 0) {
        throw new Error('Failed to Save');
      }

      // Emit Email Reservation Confirmation Command
      if (this._NewResObj.email.trim().length !== 0) {
        const subjectLine = CurrentReservationClass.getMotelName.concat(
          ' Reservation Confirmation'
        );
        EmailEvent.emit(EmailEvent.getJobName, {
          subjectLine,
          MotelName: CurrentReservationClass.getMotelName,
          MotelPhone: CurrentReservationClass.getMotelPhone,
          MotelAddress: CurrentReservationClass.getMotelAddress,
          email: this._NewResObj.email,
          firstName: this._NewResObj.firstName,
          lastName: this._NewResObj.lastName,
          numGuests: this._NewResObj.numGuests,
          checkIn: moment(this._NewResObj.checkIn).format('dddd, MMMM Do YYYY'),
          checkOut: moment(this._NewResObj.checkOut).format(
            'dddd, MMMM Do YYYY'
          ),
          pricePaid: this._NewResObj.pricePaid,
        });
      }
      return result[0];
    }

    // Guest is Currently Checked In so Add it to Current and DailyReport
    const session = await mongoose.startSession();
    session.startTransaction();

    const { type, payment } = SetTypeAndPayment(
      today,
      this._NewResObj.checkIn,
      this._NewResObj.checkOut,
      this._NewResObj.PaymentID
    );

    try {
      // can set initial field to be whoever is login as user
      const DailyReport = new DailyReportClass(HotelID);
      const updateRoomRecord = {
        BookingID: this._NewResObj.BookingID,
        type,
        payment,
        startDate: this._NewResObj.checkIn,
        endDate: moment(
          moment.utc(this._NewResObj.checkOut).subtract(1, 'day')
        ).format('YYYY-MM-DDT12:00:00[Z]'),
        paid: true,
        rate: this._NewResObj.pricePaid,
        tax: this._NewResObj.tax,
        notes: '',
        initial: '',
      };

      const houseKeepingRoomStatus = 'O';

      const UpdatedReport = await DailyReport.updateGuestRecordWithRoomStatus(
        today,
        this._NewResObj.RoomID,
        updateRoomRecord,
        houseKeepingRoomStatus,
        true,
        session
      );

      if (!UpdatedReport) throw new Error('Report is Not Defined');

      const NewReservation = await CurrentReservation.createOneNewReservation(
        this._NewResObj,
        session
      );

      if (!NewReservation || NewReservation.length === 0) {
        throw new Error('Failed to Create Reservation');
      }

      await session.commitTransaction();
      return UpdatedReport;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}

class UpdateCurrRes {
  constructor(updateResObj) {
    this._UpdateResObj = updateResObj;
  }

  async execute(HotelID) {
    const today = moment().format('YYYY-MM-DD');
    const CurrentReservation = new CurrentReservationClass(HotelID);

    // Guest has not checked in yet so is not in the DailyReport
    if (this._UpdateResObj.Checked === 0 || this._UpdateResObj.Checked === 2) {
      const result = await CurrentReservation.updateReservation(
        this._UpdateResObj,
        null,
        true
      );

      if (!result) {
        throw new Error('Reservation Does Not Exist');
      }

      return result;
    }

    // Guest is Checked In so will have to Update in DailyReport aswell
    const DailyReport = new DailyReportClass(HotelID);
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Object to Hold the Newly Updated Report
      const UpdatedResponse = {
        UpdatedRes: this._UpdateResObj,
        UpdatedReport: {},
      };

      const originalRes = await CurrentReservation.updateReservation(
        this._UpdateResObj,
        session,
        false
      );

      if (!originalRes) throw new Error('Reservation Does Not Exist');

      const originalRep = await DailyReport.getReport({ Date: today });

      if (!originalRep) throw new Error('Report is Not Defined');

      const originalRec =
        originalRep.Stays[`${originalRes.RoomID}`][
          `${DailyReport.ReservationRecord}`
        ];

      // Room Number Has Been Changed
      if (originalRes.RoomID !== this._UpdateResObj.RoomID) {
        const oldRoomRecord = {};
        const oldHouseKeepingRecordRoomStatus = 'C';
        const newHouseKeepingRecordRoomStatus = 'O';

        const result1 = await DailyReport.updateGuestRecordWithRoomStatus(
          today,
          originalRes.RoomID,
          oldRoomRecord,
          oldHouseKeepingRecordRoomStatus,
          false,
          session
        );

        const result2 = await DailyReport.updateGuestHousekeepingRecordWithRoomStatus(
          today,
          this._UpdateResObj.RoomID,
          newHouseKeepingRecordRoomStatus,
          false,
          session
        );

        if (!result1 || !result2) {
          throw new Error('Failed to Move Guest');
        }
      }

      const newRate =
        originalRec.rate +
        (this._UpdateResObj.pricePaid - originalRes.pricePaid);

      const newTax =
        originalRec.tax + (this._UpdateResObj.tax - originalRes.tax);

      const paidBool = newRate && newRate > 0 ? true : originalRec.paid;

      const updatedRecord = {
        BookingID: this._UpdateResObj.BookingID,
        notes: originalRec.notes ? originalRec.notes : '',
        type: originalRec.type ? originalRec.type : '',
        payment: originalRec.payment ? originalRec.payment : '',
        startDate: originalRec.startDate, // checkIn Does Not Change
        endDate: moment(
          moment.utc(this._UpdateResObj.checkOut).subtract(1, 'day')
        ).format('YYYY-MM-DDT12:00:00[Z]'),
        paid: paidBool,
        rate: Math.round((newRate + Number.EPSILON) * 100) / 100,
        tax: Math.round((newTax + Number.EPSILON) * 100) / 100,
        initial: originalRec.initial ? originalRec.initial : '',
      };

      // No need to check for Undefined Null Report b/c already checked above
      UpdatedResponse.UpdatedReport = await DailyReport.updateGuestRoomRecord(
        today,
        this._UpdateResObj.RoomID,
        updatedRecord,
        true,
        session
      );

      if (!UpdatedResponse.UpdatedReport) {
        throw new Error('Failed to Update Room Record in Daily Report');
      }

      await session.commitTransaction();
      return UpdatedResponse;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }
}

class UpdateCurrToPendRes {
  constructor(updateResObj) {
    this._UpdateResObj = updateResObj;
  }

  async execute(HotelID) {
    const CurrentReservation = new CurrentReservationClass(HotelID);
    const PendingReservation = new PendingReservationClass(HotelID);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result1 = await CurrentReservation.deleteReservation(
        this._UpdateResObj.BookingID,
        session
      );

      if (!result1) throw new Error('Reservation Does Not Exist');

      const result2 = await PendingReservation.createOneNewReservation(
        { ...this._UpdateResObj, Checked: 2 },
        session
      );

      if (!result2) throw new Error('Failed to Save Reservation into Pending');

      await session.commitTransaction();
      return result1;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }
}

class UpdateCurrToArrivals {
  constructor(updateResObj) {
    this._UpdateResObj = updateResObj;
  }

  async execute(HotelID) {
    const today = moment().format('YYYY-MM-DD');
    const session = await mongoose.startSession();
    session.startTransaction();

    const CurrentReservation = new CurrentReservationClass(HotelID);
    const DailyReport = new DailyReportClass(HotelID);
    try {
      const originalRes = await CurrentReservation.updateReservation(
        this._UpdateResObj,
        session,
        false
      );

      if (!originalRes) throw new Error('Reservation Does Not Exist');

      const updatedRoomRecord = {};
      const houseKeepingRoomStatus = 'C';

      const UpdatedReport = await DailyReport.updateGuestRecordWithRoomStatus(
        today,
        originalRes.RoomID,
        updatedRoomRecord,
        houseKeepingRoomStatus,
        true,
        session
      );

      if (!UpdatedReport) throw new Error('Report Does Not Exist');

      await session.commitTransaction();
      return UpdatedReport;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }
}

class CheckInCurrRes {
  constructor(updateResObj) {
    this._UpdateResObj = updateResObj;
  }

  async execute(HotelID) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const today = moment().format('YYYY-MM-DD');

    const CurrentReservation = new CurrentReservationClass(HotelID);
    const DailyReport = new DailyReportClass(HotelID);
    try {
      const UpdatedResult = { UpdatedRes: {}, UpdatedReport: {} };

      // Update the Reservation
      const result1 = await CurrentReservation.updateReservation(
        this._UpdateResObj,
        session,
        true
      );

      if (!result1) throw new Error('Reservation Does Not Exist');

      UpdatedResult.UpdatedRes = result1;

      // Set type and payment properties
      const { type, payment } = SetTypeAndPayment(
        today,
        this._UpdateResObj.checkIn,
        this._UpdateResObj.checkOut,
        this._UpdateResObj.PaymentID
      );

      // Create new record in Report
      const updatedRoomRecord = {
        BookingID: this._UpdateResObj.BookingID,
        startDate: this._UpdateResObj.checkIn,
        endDate: moment(
          moment(this._UpdateResObj.checkOut).subtract(1, 'day')
        ).format('YYYY-MM-DDT12:00:00[Z]'),
        paid: true,
        rate: this._UpdateResObj.pricePaid,
        type,
        payment,
        notes: '',
        initial: '',
        tax: this._UpdateResObj.tax,
      };

      const houseKeepingRoomStatus = 'O';

      const result2 = await DailyReport.updateGuestRecordWithRoomStatus(
        today,
        this._UpdateResObj.RoomID,
        updatedRoomRecord,
        houseKeepingRoomStatus,
        true,
        session
      );

      if (!result2) throw new Error('Report Does Not Exist');

      UpdatedResult.UpdatedReport = result2;
      await session.commitTransaction();
      return UpdatedResult;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }
}

class DeleteCurrRes {
  constructor(BookingID) {
    this._BookingID = BookingID;
  }

  async execute(HotelID) {
    const session = await mongoose.startSession();
    session.startTransaction();

    const CurrentReservation = new CurrentReservationClass(HotelID);
    const DeleteReservation = new DeleteReservationClass(HotelID);
    try {
      // Can Only Delete CurrRes w/ Checked = 0
      const deleteRes = await CurrentReservation.deleteReservation(
        this._BookingID,
        session
      );

      if (!deleteRes) throw new Error('Reservation Does Not Exist');

      const result = await DeleteReservation.createOneNewReservation(
        deleteRes,
        session
      );

      if (!result || result.length === 0) {
        throw new Error('Failed to Add to Delete');
      }

      await session.commitTransaction();
      return result[0];
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}

module.exports = {
  SearchAllCurrRes,
  CreateCurrRes,
  UpdateCurrRes,
  UpdateCurrToPendRes,
  UpdateCurrToArrivals,
  CheckInCurrRes,
  DeleteCurrRes,
};

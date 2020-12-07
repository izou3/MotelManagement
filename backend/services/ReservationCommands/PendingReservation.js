const mongoose = require('mongoose');
const moment = require('moment');

// Events Class
const EmailEvent = require('../../subscribers/EmailEvent');

const CurrentReservationClass = require('../../lib/data-access/ReservationClass/CurrentReservation');
const PendingReservationClass = require('../../lib/data-access/ReservationClass/PendingReservation');
const DeleteReservationClass = require('../../lib/data-access/ReservationClass/DeleteReservation');

class CreatePendRes {
  constructor(newResObj) {
    this._NewResObj = newResObj;
  }

  async execute(HotelID) {
    const PendingReservation = new PendingReservationClass(HotelID);
    const result = await PendingReservation.createOneNewReservation(
      this._NewResObj
    );

    if (!result || result.length === 0) {
      throw new Error('Failed to Create Reservation');
    }

    // Emit Email Reservation Confirmation Command
    if (this._NewResObj.email.trim().length !== 0) {
      const subjectLine = CurrentReservationClass.getMotelName.concat(
        ' Reservation Confirmation'
      );
      EmailEvent.emit(EmailEvent.getJobName, {
        subjectLine,
        MotelName: PendingReservationClass.getMotelName,
        MotelPhone: PendingReservationClass.getMotelPhone,
        MotelAddress: PendingReservationClass.getMotelAddress,
        email: this._NewResObj.email,
        firstName: this._NewResObj.firstName,
        lastName: this._NewResObj.lastName,
        numGuests: this._NewResObj.numGuests,
        checkIn: moment(this._NewResObj.checkIn).format('dddd, MMMM Do YYYY'),
        checkOut: moment(this._NewResObj.checkOut).format('dddd, MMMM Do YYYY'),
        pricePaid: this._NewResObj.pricePaid,
      });
    }
    /**
     * @TODO Add Agenda Queue for Email Confirmation
     */
    return result[0];
  }
}

class UpdatePendRes {
  constructor(updateResObj) {
    this._UpdateResObj = updateResObj;
  }

  async execute(HotelID) {
    const PendingReservation = new PendingReservationClass(HotelID);
    const result = await PendingReservation.updateReservation(
      this._UpdateResObj,
      null,
      true
    );

    if (!result) {
      throw new Error('Reservation is Not Defined');
    }

    return result;
  }
}

class UpdatePendToCurrRes {
  constructor(updateResObj) {
    this._UpdateResObj = updateResObj;
  }

  async execute(HotelID) {
    const PendingReservation = new PendingReservationClass(HotelID);
    const CurrentReservation = new CurrentReservationClass(HotelID);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result1 = await PendingReservation.deleteReservation(
        this._UpdateResObj.BookingID,
        session
      );

      if (!result1) throw new Error('Reservation is Not Defined');

      const result2 = await CurrentReservation.createOneNewReservation(
        this._UpdateResObj,
        session
      );

      if (!result2 || result2.length === 0) {
        throw new Error('Failed to Create Reservation');
      }

      await session.commitTransaction();
      return result2[0];
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }
}

class DeletePendRes {
  constructor(BookingID) {
    this._BookingID = BookingID;
  }

  async execute(HotelID) {
    const PendingReservation = new PendingReservationClass(HotelID);
    const DeleteReservation = new DeleteReservationClass(HotelID);

    const session = await mongoose.startSession();
    await session.startTransaction();

    try {
      const deleteRes = await PendingReservation.deleteReservation(
        this._BookingID,
        session
      );
      if (!deleteRes) throw new Error('Reservation is Not Defined');

      const newDeleteRes = await DeleteReservation.createOneNewReservation(
        deleteRes,
        session
      );

      if (!newDeleteRes || newDeleteRes.length === 0) {
        throw new Error('Failed to Remove Reservation');
      }
      await session.commitTransaction();
      return newDeleteRes;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }
}

module.exports = {
  CreatePendRes,
  UpdatePendRes,
  UpdatePendToCurrRes,
  DeletePendRes,
};

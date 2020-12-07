const DeleteReservationClass = require('../../lib/data-access/ReservationClass/DeleteReservation');

class UpdateDelRes {
  constructor(updateResObj) {
    this._UpdatedResObj = updateResObj;
  }

  async execute(HotelID) {
    const DeleteReservation = new DeleteReservationClass(HotelID);
    const result = await DeleteReservation.updateReservation(
      this._UpdatedResObj,
      null,
      true
    );

    if (!result) throw new Error('Reservation Does Not Exist');
    return result;
  }
}

class DeleteDelRes {
  constructor(BookingID) {
    this._BookingID = BookingID;
  }

  async execute(HotelID) {
    const DeleteReservation = new DeleteReservationClass(HotelID);
    const result = await DeleteReservation.deleteReservation(this._BookingID);

    if (!result) throw new Error('Reservation Does Not Exist');
    return result;
  }
}

module.exports = { UpdateDelRes, DeleteDelRes };

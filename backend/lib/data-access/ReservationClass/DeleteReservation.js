const mongoose = require('mongoose');

const Reservation = require('./index');
const ReservationModel = require('../../../models/ReservationModel');

class DeleteReservation extends Reservation {
  /**
   * Creates new Instance to reference DeleteReservation Collection
   * @param {Number} HotelID
   * @returns New Instance to reference DeleteReservation Collection
   */
  constructor(HotelID) {
    super(HotelID);
    this._connection = mongoose.model(
      'Reservation',
      ReservationModel,
      'DeleteReservation'
    );
    switch (HotelID) {
      case DeleteReservation.getLazyUID: {
        this._HotelID = DeleteReservation.getLazyUID;
        break;
      }
      case DeleteReservation.getFairValueID: {
        this._HotelID = DeleteReservation.getFairValueID;
        break;
      }
      default:
        this._HotelID = null;
    }
  }
}

module.exports = DeleteReservation;

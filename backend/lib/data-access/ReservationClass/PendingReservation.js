const mongoose = require('mongoose');

const Reservation = require('./index');
const ReservationModel = require('../../../models/ReservationModel');

class PendingReservation extends Reservation {
  /**
   * Creates new Instance to reference PendingReservation Collection
   * @param {Number} HotelID
   * @returns New Instance to reference PendingReservation Collection
   */
  constructor(HotelID) {
    super(HotelID);
    this._connection = mongoose.model(
      'Reservation',
      ReservationModel,
      'PendingReservation'
    );
    switch (HotelID) {
      case PendingReservation.getLazyUID: {
        this._HotelID = PendingReservation.getLazyUID;
        break;
      }
      case PendingReservation.getFairValueID: {
        this._HotelID = PendingReservation.getFairValueID;
        break;
      }
      default:
        this._HotelID = null;
    }
  }
}

module.exports = PendingReservation;

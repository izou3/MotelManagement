const mongoose = require('mongoose');

const Reservation = require('./index');
const ReservationModel = require('../../../models/ReservationModel');

class CurrentReservation extends Reservation {
  /**
   * Creates new Instance to reference CurrentReservation Collection
   * @param {Number} HotelID
   * @returns New Instance to reference CurrentReservation Collection
   */
  constructor(HotelID) {
    super(HotelID);
    this._connection = mongoose.model(
      'Reservation',
      ReservationModel,
      'CurrentReservation'
    );
    switch (HotelID) {
      case CurrentReservation.getLazyUID: {
        this._HotelID = CurrentReservation.getLazyUID;
        break;
      }
      case CurrentReservation.getFairValueID: {
        this._HotelID = CurrentReservation.getFairValueID;
        break;
      }
      default:
        this._HotelID = null;
    }
  }
}

module.exports = CurrentReservation;

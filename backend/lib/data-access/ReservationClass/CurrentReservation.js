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

  /**
   * @returns One document in collection with matching BookingID and Checked Field
   */
  getReservationByIDWithCheckField(BookingID, Checked) {
    return this._connection
      .findOne({
        $and: [{ BookingID }, { HotelID: this._HotelID }, { Checked }],
      })
      .select('-__v -_id -created_date')
      .lean();
  }
}

module.exports = CurrentReservation;

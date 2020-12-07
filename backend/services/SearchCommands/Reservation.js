const PendingReservation = require('../../lib/data-access/ReservationClass/PendingReservation');
const DeleteReservation = require('../../lib/data-access/ReservationClass/DeleteReservation');

class SearchReservationsByFirstName {
  constructor(firstName) {
    this._firstName = firstName;
  }

  async execute(HotelID) {
    const Pending = new PendingReservation(HotelID);

    const pendData = await Pending.getReservationByName(this._firstName);

    if (pendData.length === 0) {
      throw new Error('Failed to Find a Match');
    }
    return pendData;
  }
}

class SearchReservationsByBookingID {
  constructor(BookingID) {
    this._BookingID = BookingID;
  }

  async execute(HotelID) {
    const Pending = new PendingReservation(HotelID);

    const pendData = await Pending.getReservationByID(this._BookingID);

    if (!pendData) {
      throw new Error('Failed to Find a Match');
    }

    return pendData;
  }
}

class SearchReservationsByCheckIn {
  constructor(start, end) {
    this._start = start;
    this._end = end;
  }

  async execute(HotelID) {
    const Pending = new PendingReservation(HotelID);

    const result = await Pending.getReservationByCheckIn(
      this._start,
      this._end
    );
    if (result.length === 0) {
      throw new Error('Failed to Find a Match');
    }
    return result;
  }
}

class SearchReservationsByCheckOut {
  constructor(start, end) {
    this._start = start;
    this._end = end;
  }

  async execute(HotelID) {
    const Pending = new PendingReservation(HotelID);

    const result = await Pending.getReservationByCheckOut(
      this._start,
      this._end
    );
    if (result.length === 0) {
      throw new Error('Failed to Find a Match');
    }
    return result;
  }
}

class SearchDelResByFirstName {
  constructor(firstName) {
    this._firstName = firstName;
  }

  async execute(HotelID) {
    const Delete = new DeleteReservation(HotelID);
    const result = await Delete.getReservationByName(this._firstName);

    if (result.length === 0) {
      throw new Error('Failed to Find a Match');
    }
    return result;
  }
}

class SearchDelResByBookingID {
  constructor(BookingID) {
    this._BookingID = BookingID;
  }

  async execute(HotelID) {
    const Delete = new DeleteReservation(HotelID);

    const result = await Delete.getReservationByID(this._BookingID);

    if (!result) {
      throw new Error('Failed to Find a Match');
    }
    return result;
  }
}

class SearchDelResByCheckIn {
  constructor(start, end) {
    this._start = start;
    this._end = end;
  }

  async execute(HotelID) {
    const Delete = new DeleteReservation(HotelID);

    const result = await Delete.getReservationByCheckIn(this._start, this._end);
    if (result.length === 0) {
      throw new Error('Failed to Find a Match');
    }
    return result;
  }
}

class SearchDelResByCheckOut {
  constructor(start, end) {
    this._start = start;
    this._end = end;
  }

  async execute(HotelID) {
    const Delete = new DeleteReservation(HotelID);

    const result = await Delete.getReservationByCheckOut(
      this._start,
      this._end
    );
    if (result.length === 0) {
      throw new Error('Failed to Find a Match');
    }
    return result;
  }
}

module.exports = {
  SearchReservationsByFirstName,
  SearchReservationsByBookingID,
  SearchReservationsByCheckIn,
  SearchReservationsByCheckOut,
  SearchDelResByFirstName,
  SearchDelResByBookingID,
  SearchDelResByCheckIn,
  SearchDelResByCheckOut,
};

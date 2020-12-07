/**
 * Conductor Instance to run inividual commands
 */
class Conductor {
  constructor(HotelID) {
    this._HotelID = HotelID || null;
  }

  set setHotelID(HotelID) {
    this._HotelID = HotelID;
  }

  get getHotelID() {
    return this._HotelID;
  }

  async run(command) {
    return command.execute(this._HotelID);
  }
}

/**
 * Singleton Pattern so all commands have access to the same HotelID variable
 * passed as a query param on each request
 */
module.exports = new Conductor();

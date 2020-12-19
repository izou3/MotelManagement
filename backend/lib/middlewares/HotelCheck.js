const Conductor = require('../../services/conductor.js');

module.exports = {
  /**
   * Check for HotelID in Query Parameter and sets the
   * Conductor HotelID variable
   */
  HotelIDRequired: (req, res, next) => {
    const { HotelID } = req.query;
    if (HotelID) {
      Conductor.setHotelID = HotelID;
      return next();
    }
    const err = new Error('Need to Specify Hotel');
    err.status = 400;
    return next(err);
  },
};

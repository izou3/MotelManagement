const LOAD_ALL_STAFF = require('../actions/Staff');

module.exports = (param) => {
  const { admin, command, payload, logger } = param;

  if (command === 'UpdateStaff') {
    const { HotelID, staffArray } = payload;
    admin.to(HotelID).emit('action', {
      type: LOAD_ALL_STAFF,
      payload: {
        staffArray,
      },
    });
  } else {
    logger.error('Unidentified Type from Event');
  }
};

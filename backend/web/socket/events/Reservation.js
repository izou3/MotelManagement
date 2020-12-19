const {
  LOAD_PEND_RESERVATION_SUCCESS,
  LOAD_CURR_RESERVATION_SUCCESS,
  LOAD_OVER_RESERVATION_SUCCESS,
} = require('../actions/Reservation');

module.exports = (param) => {
  const { admin, command, payload, logger } = param;

  if (command === 'LoadCurrRes') {
    const { HotelID, resList } = payload;
    admin.to(HotelID).emit('action', {
      type: LOAD_CURR_RESERVATION_SUCCESS,
      payload: {
        resList,
      },
    });
  } else if (command === 'LoadPendRes') {
    const { HotelID, resList } = payload;
    admin.to(HotelID).emit('action', {
      type: LOAD_PEND_RESERVATION_SUCCESS,
      payload: {
        resList,
      },
    });
  } else if (command === 'LoadOverRes') {
    const { HotelID, resList } = payload;
    admin.to(HotelID).emit('action', {
      type: LOAD_OVER_RESERVATION_SUCCESS,
      payload: {
        resList,
      },
    });
  } else {
    logger.error('Unidentified Type from Event');
  }
};

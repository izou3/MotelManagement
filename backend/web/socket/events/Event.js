const {
  SNACKBAR_FAIL,
  SNACKBAR_SUCCESS,
  SNACKBAR_CLOSE,
  UPDATE_STAYOVERS,
  UPDATE_AVAILABLE,
  UPDATE_CHECKIN,
} = require('../actions/Event.js');

module.exports = (param) => {
  const { admin, socket, command, payload, logger } = param;

  if (command === 'UpdateStayOverData') {
    const { HotelID, num } = payload;
    admin.to(HotelID).emit('action', {
      type: UPDATE_STAYOVERS,
      payload: {
        num,
      },
    });
  } else if (command === 'UpdateAvailableData') {
    const { HotelID, num } = payload;
    admin.to(HotelID).emit('action', {
      type: UPDATE_AVAILABLE,
      payload: {
        num,
      },
    });
  } else if (command === 'UpdateCheckInData') {
    const { HotelID, num } = payload;
    admin.to(HotelID).emit('action', {
      type: UPDATE_CHECKIN,
      payload: {
        num,
      },
    });
  } else if (command === 'SnackBarSuccess') {
    const { HotelID, message } = payload;
    socket.to(HotelID).emit('action', {
      type: SNACKBAR_SUCCESS,
      payload: {
        message,
      },
    });
  } else if (command === 'SnackBarFail') {
    const { HotelID, message } = payload;
    socket.to(HotelID).emit('action', {
      type: SNACKBAR_FAIL,
      payload: {
        message,
      },
    });
  } else if (command === 'SnackBarClose') {
    const { HotelID } = payload;
    socket.to(HotelID).emit('action', {
      type: SNACKBAR_CLOSE,
    });
  } else {
    logger.error('Unidentified Type from Event');
  }
};

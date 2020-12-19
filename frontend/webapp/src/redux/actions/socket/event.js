/**
 * Socket Event Actions
 */
export const SOCKET_UPDATE_STAYOVERS = 'server/4/UpdateStayOverData';
export const updateSocketStayOvers = (HotelID, num) => ({
  type: SOCKET_UPDATE_STAYOVERS,
  payload: {
    HotelID,
    num,
  },
});

export const SOCKET_UPDATE_AVAILABLE = 'server/4/UpdateAvailableData';
export const updateSocketAvailable = (HotelID, num) => ({
  type: SOCKET_UPDATE_AVAILABLE,
  payload: {
    HotelID,
    num,
  },
});

export const SOCKET_UPDATE_CHECKIN = 'server/4/UpdateCheckInData';
export const updateSocketCheckIn = (HotelID, num) => ({
  type: SOCKET_UPDATE_CHECKIN,
  payload: {
    HotelID,
    num,
  },
});

export const SOCKET_SNACKBAR_FAIL = 'server/4/SnackBarSuccess';
export const snackBarSocketFail = (HotelID, message) => ({
  type: SOCKET_SNACKBAR_FAIL,
  payload: { HotelID, message },
});

export const SOCKET_SNACKBAR_SUCCESS = 'server/4/SnackBarFail';
export const snackBarSocketSuccess = (HotelID, message) => ({
  type: SOCKET_SNACKBAR_SUCCESS,
  payload: { HotelID, message },
});

export const SOCKET_SNACKBAR_CLOSE = 'server/4/SnackBarClose';
export const snackBarSocketClose = (HotelID) => ({
  type: SOCKET_SNACKBAR_CLOSE,
  payload: {
    HotelID,
  },
});

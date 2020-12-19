/**
 * Socket Form Actions on Main Dashboard
 */

export const SOCKET_LOAD_FORM = 'server/4/SnackBarSuccess';
export const socketLoadForm = (user, RoomID) => ({
  type: SOCKET_LOAD_FORM,
  payload: {
    HotelID: user.HotelID,
    message: `${user.firstName} is editing Room ${RoomID}`,
  },
});

export const SOCKET_LOAD_PENDING_FORM = 'server/4/SnackBarSuccess';
export const socketLoadPendingForm = (user, data) => ({
  type: SOCKET_LOAD_PENDING_FORM,
  payload: {
    HotelID: user.HotelID,
    message: `${user.firstName} is editing arrivals with name ${data.firstName}`,
  },
});

export const SOCKET_LOAD_OVER_FORM = 'server/4/SnackBarSuccess';
export const socketLoadOverForm = (user, data) => ({
  type: SOCKET_LOAD_OVER_FORM,
  payload: {
    HotelID: user.HotelID,
    message: `${user.firstName} is editing overdue reservations with name ${data.firstName}`,
  },
});

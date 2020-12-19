/**
 * Reservation Socket Events
 */

export const SOCKET_LOAD_CURR_RESERVATION_SUCCESS = 'server/1/LoadCurrRes';
export const loadSocketCurrResSuccess = (HotelID, resList) => ({
  type: SOCKET_LOAD_CURR_RESERVATION_SUCCESS,
  payload: {
    HotelID,
    resList,
  },
});

export const SOCKET_LOAD_PEND_RESERVATION_SUCCESS = 'server/1/LoadPendRes';
export const loadSocketPendResSuccess = (HotelID, resList) => ({
  type: SOCKET_LOAD_PEND_RESERVATION_SUCCESS,
  payload: {
    HotelID,
    resList,
  },
});

export const SOCKET_LOAD_OVER_RESERVATION_SUCCESS = 'server/1/LoadOverRes';
export const loadSocketOverResSuccess = (HotelID, resList) => ({
  type: SOCKET_LOAD_OVER_RESERVATION_SUCCESS,
  payload: {
    HotelID,
    resList,
  },
});

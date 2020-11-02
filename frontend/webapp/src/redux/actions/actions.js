/**
 * Defined Actions for Reducers
 */

/** **************************************************************
 * Actions for the currRes, pendRes, and overRes States
 **************************************************************** */
export const LOAD_RESERVATION_INPROGRESS = 'LOAD_RESERVATION_INPROGRESS';
export const loadResProgress = () => ({
  type: LOAD_RESERVATION_INPROGRESS,
});

export const LOAD_RESERVATION_FAILURE = 'LOAD_RESERVATION_FAILURE';
export const loadResFail = () => ({
  type: LOAD_RESERVATION_FAILURE,
});

export const LOAD_CURR_RESERVATION_SUCCESS = 'LOAD_CURR_RESERVATION_SUCCESS';
export const loadCurrResSuccess = (resList) => ({
  type: LOAD_CURR_RESERVATION_SUCCESS,
  payload: {
    resList,
  },
});

export const LOAD_PEND_RESERVATION_SUCCESS = 'LOAD_PEND_RESERVATION_SUCCESS';
export const loadPendResSuccess = (resList) => ({
  type: LOAD_PEND_RESERVATION_SUCCESS,
  payload: {
    resList,
  },
});

export const LOAD_OVER_RESERVATION_SUCCESS = 'LOAD_RESERVATION_SUCCESS';
export const loadOverResSuccess = (resList) => ({
  type: LOAD_OVER_RESERVATION_SUCCESS,
  payload: {
    resList,
  },
});

/** **************************************************************
 * Actions for the Snack Bar Reducer
 **************************************************************** */

export const SNACKBAR_FAIL = 'SNACKBAR_FAIL';
export const snackBarFail = (message) => ({
  type: SNACKBAR_FAIL,
  payload: { message },
});

export const SNACKBAR_SUCCESS = 'SNACKBAR_SUCCESS';
export const snackBarSuccess = (message) => ({
  type: SNACKBAR_SUCCESS,
  payload: { message },
});

export const SNACKBAR_CLOSE = 'SNACKBAR_CLOSE';
export const snackBarClose = () => ({
  type: SNACKBAR_CLOSE,
});

/** **************************************************************
 * Actions for Full Page Loader
 **************************************************************** */
export const SHOW_LOADING = 'SHOW_LOADING';
export const showLoading = () => ({
  type: SHOW_LOADING,
});

export const HIDE_LOADING = 'HIDE_LOADING';
export const hideLoading = () => ({
  type: HIDE_LOADING,
});

/** **************************************************************
 * Update Dashboard info
 **************************************************************** */
export const UPDATE_STAYOVERS = 'UPDATE_STAYOVERS';
export const updateStayOvers = (num) => ({
  type: UPDATE_STAYOVERS,
  payload: {
    num,
  },
});

export const UPDATE_AVAILABLE = 'UPDATE_AVAILABLE';
export const updateAvailable = (num) => ({
  type: UPDATE_AVAILABLE,
  payload: {
    num,
  },
});

export const UPDATE_CHECKIN = 'UPDATE_CHECKIN';
export const updateCheckIn = (num) => ({
  type: UPDATE_CHECKIN,
  payload: {
    num,
  },
});

export const UPDATE_CHECKOUT = 'UPDATE_CHECKOUT';
export const updateCheckOut = (num) => ({
  type: UPDATE_CHECKOUT,
  payload: {
    num,
  },
});

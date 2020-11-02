import axios from 'axios';
import { batchActions } from 'redux-batched-actions';

import {
  snackBarFail,
  snackBarSuccess,
  showLoading,
  hideLoading,
} from '../actions/actions';

import {
  loadSearchResultSuccess,
  loadSearchResultFail,
  loadSearchResultInProgress,
} from '../actions/searchActions';

/** *************************************************
 * Reservation Search Thunks
 * @param {} dispatch
 ************************************************* */
export const searchResByID = (ID) => async (dispatch, getState) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(`/api/search/reservations/BookingID?BookingID=${ID}`)
    .then((res) => {
      dispatch(
        batchActions([
          loadSearchResultSuccess([res.data]),
          hideLoading(),
          snackBarSuccess('1 Result Found'),
        ])
      );
    })
    .catch(() => {
      dispatch(
        batchActions([
          hideLoading(),
          snackBarFail('Failed to Find a Match'),
          loadSearchResultFail(),
        ])
      );
    });
};
export const searchResFirstName = (name) => async (dispatch, getState) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(`/api/search/reservations/firstName?firstName=${name}`)
    .then((res) => {
      dispatch(
        batchActions([
          hideLoading(),
          loadSearchResultSuccess(res.data),
          snackBarSuccess(`${res.data.length} Results Found`),
        ])
      );
    })
    .catch(() => {
      dispatch(
        batchActions([
          hideLoading(),
          snackBarFail('Failed to Find a Match'),
          loadSearchResultFail(),
        ])
      );
    });
};
export const searchResByCheckIn = (start, end) => async (
  dispatch,
  getState
) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(`/api/search/reservations/checkIn?start=${start}&end=${end}`)
    .then((res) => {
      dispatch(
        batchActions([
          hideLoading(),
          loadSearchResultSuccess(res.data),
          snackBarSuccess(`${res.data.length} Results Found`),
        ])
      );
    })
    .catch(() => {
      dispatch(
        batchActions([
          hideLoading(),
          snackBarFail('Failed to Find a Match'),
          loadSearchResultFail(),
        ])
      );
    });
};
export const searchResByCheckOut = (start, end) => async (
  dispatch,
  getState
) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(`/api/search/reservations/checkOut?start=${start}&end=${end}`)
    .then((res) => {
      dispatch(
        batchActions([
          hideLoading(),
          loadSearchResultSuccess(res.data),
          snackBarSuccess(`${res.data.length} Results Found`),
        ])
      );
    })
    .catch(() => {
      dispatch(
        batchActions([
          hideLoading(),
          snackBarFail('Failed to Find a Match'),
          loadSearchResultFail(),
        ])
      );
    });
};

/** ************************************************
 * Customer Search Thunks
 ************************************************** */
export const searchCustomerByID = (ID) => async (dispatch, getState) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(`/api/search/customers/BookingID?BookingID=${ID}`)
    .then((res) => {
      dispatch(
        batchActions([
          hideLoading(),
          loadSearchResultSuccess(res.data),
          snackBarSuccess(`1 Result Found`),
        ])
      );
    })
    .catch(() => {
      dispatch(
        batchActions([
          hideLoading(),
          snackBarFail('Failed to Find a Match'),
          loadSearchResultFail(),
        ])
      );
      // }
    });
};
export const searchCustomerFirstName = (name) => async (dispatch, getState) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(`/api/search/customers/firstName?firstName=${name}`)
    .then((res) => {
      dispatch(
        batchActions([
          hideLoading(),
          loadSearchResultSuccess(res.data),
          snackBarSuccess(`${res.data.length} Results Found`),
        ])
      );
    })
    .catch(() => {
      dispatch(
        batchActions([
          hideLoading(),
          snackBarFail('Failed to Find a Match'),
          loadSearchResultFail(),
        ])
      );
    });
};
export const searchCustomerByCheckIn = (start, end) => async (
  dispatch,
  getState
) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(`/api/search/customers/checkIn?start=${start}&end=${end}`)
    .then((res) => {
      dispatch(
        batchActions([
          hideLoading(),
          loadSearchResultSuccess(res.data),
          snackBarSuccess(`${res.data.length} Results Found`),
        ])
      );
    })
    .catch(() => {
      dispatch(
        batchActions([
          hideLoading(),
          snackBarFail('Failed to Find a Match'),
          loadSearchResultFail(),
        ])
      );
    });
};
export const searchCustomerByCheckOut = (start, end) => async (
  dispatch,
  getState
) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(`/api/search/customers/checkOut?start=${start}&end=${end}`)
    .then((res) => {
      dispatch(
        batchActions([
          hideLoading(),
          loadSearchResultSuccess(res.data),
          snackBarSuccess(`${res.data.length} Results Found`),
        ])
      );
    })
    .catch(() => {
      dispatch(
        batchActions([
          hideLoading(),
          snackBarFail('Failed to Find a Match'),
          loadSearchResultFail(),
        ])
      );
    });
};

/** *************************************************
 * Deleted Res Search Thunks
 ************************************************* */
export const searchDeleteResByID = (ID) => async (dispatch, getState) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(`/api/search/delreservations/BookingID?BookingID=${ID}`)
    .then((res) => {
      dispatch(
        batchActions([
          hideLoading(),
          loadSearchResultSuccess([res.data]),
          snackBarSuccess(`1 Result Found`),
        ])
      );
    })
    .catch(() => {
      dispatch(
        batchActions([
          hideLoading(),
          snackBarFail('Failed to Find a Match'),
          loadSearchResultFail(),
        ])
      );
    });
};
export const searchDeleteResFirstName = (name) => async (
  dispatch,
  getState
) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(`/api/search/delreservations/firstName?firstName=${name}`)
    .then((res) => {
      dispatch(
        batchActions([
          hideLoading(),
          loadSearchResultSuccess(res.data),
          snackBarSuccess(`${res.data.length} Results Found`),
        ])
      );
    })
    .catch(() => {
      dispatch(
        batchActions([
          hideLoading(),
          snackBarFail('Failed to Find a Match'),
          loadSearchResultFail(),
        ])
      );
    });
};
export const searchDeleteResByCheckIn = (start, end) => async (
  dispatch,
  getState
) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(`/api/search/delreservations/checkIn?start=${start}&end=${end}`)
    .then((res) => {
      dispatch(
        batchActions([
          hideLoading(),
          loadSearchResultSuccess(res.data),
          snackBarSuccess(`${res.data.length} Results Found`),
        ])
      );
    })
    .catch(() => {
      dispatch(
        batchActions([
          hideLoading(),
          snackBarFail('Failed to Find a Match'),
          loadSearchResultFail(),
        ])
      );
    });
};
export const searchDeleteResByCheckOut = (start, end) => async (
  dispatch,
  getState
) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(`/api/search/delreservations/checkOut?start=${start}&end=${end}`)
    .then((res) => {
      dispatch(
        batchActions([
          hideLoading(),
          loadSearchResultSuccess(res.data),
          snackBarSuccess(`${res.data.length} Results Found`),
        ])
      );
    })
    .catch(() => {
      dispatch(
        batchActions([
          hideLoading(),
          snackBarFail('Failed to Find a Match'),
          loadSearchResultFail(),
        ])
      );
    });
};

/** *************************************************
 * BlackList Customer Search Thunks
 ************************************************* */
export const searchBlackListByFirstName = (firstName) => async (
  dispatch,
  getState
) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(`/api/search/blacklist/name?firstName=${firstName}`)
    .then((res) => {
      dispatch(
        batchActions([
          hideLoading(),
          loadSearchResultSuccess(res.data),
          snackBarSuccess(`${res.data.length} Results Found`),
        ])
      );
    })
    .catch(() => {
      dispatch(
        batchActions([
          hideLoading(),
          snackBarFail('Failed to Find a Match'),
          loadSearchResultFail(),
        ])
      );
    });
};

export const searchBlackListByID = (BookingID) => async (
  dispatch,
  getState
) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(`/api/search/blacklist/id?BookingID=${BookingID}`)
    .then((res) => {
      dispatch(
        batchActions([
          hideLoading(),
          loadSearchResultSuccess(res.data),
          snackBarSuccess(`${res.data.length} Results Found`),
        ])
      );
    })
    .catch(() => {
      dispatch(
        batchActions([
          hideLoading(),
          snackBarFail('Failed to Find a Match'),
          loadSearchResultFail(),
        ])
      );
    });
};

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

import { logoutUser } from '../actions/authActions';

/** *************************************************
 * Reservation Search Thunks
 * @param {} dispatch
 ************************************************* */
export const searchResByID = (ID) => async (dispatch, getState) => {
  axios
    .get('/validAccess')
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );

  const state = getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }

  const { HotelID } = state.authState.user;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(
      `/api/search/reservations/BookingID?HotelID=${HotelID}&BookingID=${ID}`
    )
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
  axios
    .get('/validAccess')
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );

  const state = getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }

  const { HotelID } = state.authState.user;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(
      `/api/search/reservations/firstName?HotelID=${HotelID}&firstName=${name}`
    )
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
  axios
    .get('/validAccess')
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );

  const state = getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }

  const { HotelID } = state.authState.user;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(
      `/api/search/reservations/checkIn?HotelID=${HotelID}&start=${start}&end=${end}`
    )
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
  axios
    .get('/validAccess')
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );

  const state = getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }

  const { HotelID } = state.authState.user;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(
      `/api/search/reservations/checkOut?HotelID=${HotelID}&start=${start}&end=${end}`
    )
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
  axios
    .get('/validAccess')
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );

  const state = getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }

  const { HotelID } = state.authState.user;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(`/api/search/customers/BookingID?HotelID=${HotelID}&BookingID=${ID}`)
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
  axios
    .get('/validAccess')
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );

  const state = getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }

  const { HotelID } = state.authState.user;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(`/api/search/customers/firstName?HotelID=${HotelID}&firstName=${name}`)
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
  axios
    .get('/validAccess')
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );

  const state = getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }

  const { HotelID } = state.authState.user;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(
      `/api/search/customers/checkIn?HotelID=${HotelID}&start=${start}&end=${end}`
    )
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
  axios
    .get('/validAccess')
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );

  const state = getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }

  const { HotelID } = state.authState.user;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(
      `/api/search/customers/checkOut?HotelID=${HotelID}&start=${start}&end=${end}`
    )
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
  axios
    .get('/validAccess')
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );

  const state = getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }

  const { HotelID } = state.authState.user;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(
      `/api/search/delreservations/BookingID?HotelID=${HotelID}&BookingID=${ID}`
    )
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
  axios
    .get('/validAccess')
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );

  const state = getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }

  const { HotelID } = state.authState.user;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(
      `/api/search/delreservations/firstName?HotelID=${HotelID}&firstName=${name}`
    )
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
  axios
    .get('/validAccess')
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );

  const state = getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }

  const { HotelID } = state.authState.user;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(
      `/api/search/delreservations/checkIn?HotelID=${HotelID}&start=${start}&end=${end}`
    )
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
  axios
    .get('/validAccess')
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );

  const state = getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }

  const { HotelID } = state.authState.user;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(
      `/api/search/delreservations/checkOut?HotelID=${HotelID}&start=${start}&end=${end}`
    )
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
  axios
    .get('/validAccess')
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );

  const state = getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }

  const { HotelID } = state.authState.user;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(`/api/search/blacklist/name?HotelID=${HotelID}&firstName=${firstName}`)
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
  axios
    .get('/validAccess')
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );

  const state = getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }

  const { HotelID } = state.authState.user;

  dispatch(showLoading());
  dispatch(loadSearchResultInProgress());
  return axios
    .get(`/api/search/blacklist/id?HotelID=${HotelID}&BookingID=${BookingID}`)
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

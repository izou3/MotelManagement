import { batchActions } from 'redux-batched-actions';

// Config
import config from '../../config';
import axios from './axios';

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

const Config = config[process.env.NODE_ENV || 'development'];

/** *************************************************
 * Reservation Search Thunks
 * @param {} dispatch
 ************************************************* */
export const searchResByID = (ID) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      dispatch(loadSearchResultInProgress());
      return axios
        .get(
          `${Config.apiHost}/api/search/reservations/BookingID?HotelID=${HotelID}&BookingID=${ID}`
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
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};
export const searchResFirstName = (name) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      dispatch(loadSearchResultInProgress());
      return axios
        .get(
          `${Config.apiHost}/api/search/reservations/firstName?HotelID=${HotelID}&firstName=${name}`
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
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};
export const searchResByCheckIn = (start, end) => async (
  dispatch,
  getState
) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      dispatch(loadSearchResultInProgress());
      return axios
        .get(
          `${Config.apiHost}/api/search/reservations/checkIn?HotelID=${HotelID}&start=${start}&end=${end}`
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
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};
export const searchResByCheckOut = (start, end) => async (
  dispatch,
  getState
) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      dispatch(loadSearchResultInProgress());
      return axios
        .get(
          `${Config.apiHost}/api/search/reservations/checkOut?HotelID=${HotelID}&start=${start}&end=${end}`
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
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};

/** ************************************************
 * Customer Search Thunks
 ************************************************** */
export const searchCustomerByID = (ID) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      dispatch(loadSearchResultInProgress());
      return axios
        .get(
          `${Config.apiHost}/api/search/customers/BookingID?HotelID=${HotelID}&BookingID=${ID}`
        )
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
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};
export const searchCustomerFirstName = (name) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      dispatch(loadSearchResultInProgress());
      return axios
        .get(
          `${Config.apiHost}/api/search/customers/firstName?HotelID=${HotelID}&firstName=${name}`
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
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};
export const searchCustomerByCheckIn = (start, end) => async (
  dispatch,
  getState
) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;

      dispatch(loadSearchResultInProgress());
      return axios
        .get(
          `${Config.apiHost}/api/search/customers/checkIn?HotelID=${HotelID}&start=${start}&end=${end}`
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
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};
export const searchCustomerByCheckOut = (start, end) => async (
  dispatch,
  getState
) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      dispatch(loadSearchResultInProgress());
      return axios
        .get(
          `${Config.apiHost}/api/search/customers/checkOut?HotelID=${HotelID}&start=${start}&end=${end}`
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
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};

/** *************************************************
 * Deleted Res Search Thunks
 ************************************************* */
export const searchDeleteResByID = (ID) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;

      dispatch(loadSearchResultInProgress());
      return axios
        .get(
          `${Config.apiHost}/api/search/delreservations/BookingID?HotelID=${HotelID}&BookingID=${ID}`
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
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};
export const searchDeleteResFirstName = (name) => async (
  dispatch,
  getState
) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      dispatch(loadSearchResultInProgress());
      return axios
        .get(
          `${Config.apiHost}/api/search/delreservations/firstName?HotelID=${HotelID}&firstName=${name}`
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
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};
export const searchDeleteResByCheckIn = (start, end) => async (
  dispatch,
  getState
) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      dispatch(loadSearchResultInProgress());
      return axios
        .get(
          `${Config.apiHost}/api/search/delreservations/checkIn?HotelID=${HotelID}&start=${start}&end=${end}`
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
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};
export const searchDeleteResByCheckOut = (start, end) => async (
  dispatch,
  getState
) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      dispatch(loadSearchResultInProgress());
      return axios
        .get(
          `${Config.apiHost}/api/search/delreservations/checkOut?HotelID=${HotelID}&start=${start}&end=${end}`
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
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};

/** *************************************************
 * BlackList Customer Search Thunks
 ************************************************* */
export const searchBlackListByFirstName = (firstName) => async (
  dispatch,
  getState
) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      dispatch(loadSearchResultInProgress());
      return axios
        .get(
          `${Config.apiHost}/api/search/blacklist/name?HotelID=${HotelID}&firstName=${firstName}`
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
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};

export const searchBlackListByLastName = (lastName) => async (
  dispatch,
  getState
) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      dispatch(loadSearchResultInProgress());
      return axios
        .get(
          `${Config.apiHost}/api/search/blacklist/lastName?HotelID=${HotelID}&lastName=${lastName}`
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
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};

export const searchBlackListByID = (BookingID) => async (
  dispatch,
  getState
) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      dispatch(loadSearchResultInProgress());
      return axios
        .get(
          `${Config.apiHost}/api/search/blacklist/id?HotelID=${HotelID}&BookingID=${BookingID}`
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
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};

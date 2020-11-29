import axios from 'axios';
import { batchActions } from 'redux-batched-actions';
import {
  snackBarFail,
  snackBarSuccess,
  showLoading,
  hideLoading,
} from '../actions/actions';

import { loadSearchResultSuccess } from '../actions/searchActions';

import { loadFormFail } from '../actions/formActions';

import { logoutUser } from '../actions/authActions';

export const updateCustomer = (updatedCust) => async (dispatch, getState) => {
  // Check auth state of cookies or from tokenExpiration Middleware and don't execute
  // remainder of auth if not authenticated
  axios.get('/validAccess')
    .catch(() => {
      return dispatch(
        batchActions([
          logoutUser(),
          snackBarSuccess('UnAuthorized Access')
        ])
      );
    });

  const state = getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }

  dispatch(showLoading());
  return axios
    .put(`/api/customer/`, updatedCust)
    .then(() => {
      const searchResult = state.searchResultState.results;
      for (let i = 0; i < searchResult.length; i++) {
        if (searchResult[i].BookingID === updatedCust.BookingID) {
          searchResult[i] = updatedCust;
          break;
        }
      }
      dispatch(
        batchActions([
          loadSearchResultSuccess(searchResult),
          loadFormFail(),
          hideLoading(),
          snackBarSuccess('Updated Successfully'),
        ])
      );
    })
    .catch(() => {
      dispatch(
        batchActions([
          hideLoading(),
          snackBarFail('Failed to Update'),
        ])
      );
    });
};

export const updateBlackListCust = (updatedCust) => async (
  dispatch,
  getState
) => {
  const state = getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }

  dispatch(showLoading());
  axios.get('/validAccess')
    .catch(() => {
      return dispatch(
        batchActions([
          logoutUser(),
          snackBarSuccess('UnAuthorized Access')
        ])
      );
    });

  return axios
    .put(`/api/blacklist`, updatedCust)
    .then(() => {
      const searchResult = state.searchResultState.results;

      for (let i = 0; i < searchResult.length; i++) {
        if (searchResult[i].BookingID === updatedCust.BookingID) {
          searchResult[i] = updatedCust;
          break;
        }
      }

      dispatch(
        batchActions([
          loadSearchResultSuccess(searchResult),
          loadFormFail(),
          hideLoading(),
          snackBarSuccess('Updated Successfully'),
        ])
      );
    })
    .catch(() => {
      dispatch(batchActions([hideLoading(), snackBarFail('Failed to Update')]));
    });
};

// Add and delete Blacklist Customers from Search Result
export const addBlackListCust = (newCust) => async (dispatch, getState) => {
  dispatch(showLoading());
  const state = getState();

  axios.get('/validAccess')
    .catch(() => {
      return dispatch(
        batchActions([
          logoutUser(),
          snackBarSuccess('UnAuthorized Access')
        ])
      );
    });

  if (!state.authState.isAuthenticated) {
    return null;
  }

  return axios
    .post(`/api/blacklist`, newCust)
    .then(() => {
      dispatch(
        batchActions([
          loadFormFail(),
          hideLoading(),
          snackBarSuccess('Added Successfully'),
        ])
      );
    })
    .catch(() => {
      dispatch(
        batchActions([
          loadFormFail(),
          hideLoading(),
          snackBarFail('Already in Blacklist'),
        ])
      );
    });
};

export const removeBlackListCust = (id) => async (dispatch, getState) => {
  const state = getState();
  axios.get('/validAccess')
    .catch(() => {
      return dispatch(
        batchActions([
          logoutUser(),
          snackBarSuccess('UnAuthorized Access')
        ])
      );
    });

  if (!state.authState.isAuthenticated) {
    return null;
  }

  dispatch(showLoading());
  return axios
    .delete(`/api/blacklist?BookingID=${id}`)
    .then(() => {
      const searchResult = state.searchResultState.results;

      for (let i = 0; i < searchResult.length; i++) {
        if (searchResult[i].BookingID === id) {
          searchResult.splice(i, 1);
          break;
        }
      }

      dispatch(
        batchActions([
          loadSearchResultSuccess(searchResult),
          loadFormFail(),
          hideLoading(),
          snackBarSuccess('Removed Successfully'),
        ])
      );
    })
    .catch(() => {
      dispatch(
        batchActions([
          hideLoading(),
          snackBarFail('Failed to Update'),
        ])
      );
    });
};

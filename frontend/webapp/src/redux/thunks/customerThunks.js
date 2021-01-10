import { batchActions } from 'redux-batched-actions';

// Config
import config from '../../config';
import axios from './axios';

// Actions
import {
  snackBarFail,
  snackBarSuccess,
  showLoading,
  hideLoading,
} from '../actions/actions';

import { loadSearchResultSuccess } from '../actions/searchActions';

import { loadFormFail } from '../actions/formActions';

import { logoutUser } from '../actions/authActions';

const Config = config[process.env.NODE_ENV || 'development'];

export const updateCustomer = (updatedCust) => async (dispatch, getState) => {
  // Check auth state of cookies or from tokenExpiration Middleware and don't execute
  // remainder of auth if not authenticated
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      return axios
        .put(`${Config.apiHost}/api/customer?HotelID=${HotelID}`, updatedCust)
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
            batchActions([hideLoading(), snackBarFail('Failed to Update')])
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

export const updateBlackListCust = (updatedCust) => async (
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
      return axios
        .put(`${Config.apiHost}/api/blacklist?HotelID=${HotelID}`, updatedCust)
        .then(() => {
          const searchResult = state.searchResultState.results;

          for (let i = 0; i < searchResult.length; i++) {
            if (searchResult[i].CustomerID === updatedCust.CustomerID) {
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
            batchActions([hideLoading(), snackBarFail('Failed to Update')])
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

// Add and delete Blacklist Customers from Search Result
export const addNewBlackListCust = (newCustObj) => async (
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

      return axios
        .post(
          `${Config.apiHost}/api/blacklist/NewCustomer?HotelID=${HotelID}`,
          newCustObj
        )
        .then(() => {
          dispatch(
            batchActions([
              loadFormFail(),
              hideLoading(),
              snackBarSuccess('Added Successfully'),
            ])
          );
        })
        .catch((err) => {
          const message =
            err.response.data.message === 'Customer Already In BlackList'
              ? 'Customer Already In BlackList'
              : 'Failed to Add to BlackList';
          dispatch(batchActions([hideLoading(), snackBarFail(message)]));
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
export const addBlackListCust = (newCust) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;

      return axios
        .post(`${Config.apiHost}/api/blacklist?HotelID=${HotelID}`, newCust)
        .then(() => {
          dispatch(
            batchActions([
              loadFormFail(),
              hideLoading(),
              snackBarSuccess('Added Successfully to BlackList'),
            ])
          );
        })
        .catch((err) => {
          const message =
            err.response.data.message === 'Customer Already In BlackList'
              ? 'Customer Already In BlackList'
              : 'Failed to Add to BlackList';
          dispatch(batchActions([hideLoading(), snackBarFail(message)]));
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

export const removeBlackListCust = (CustomerID) => async (
  dispatch,
  getState
) => {
  dispatch(showLoading());
  axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;

      return axios
        .delete(
          `${Config.apiHost}/api/blacklist?HotelID=${HotelID}&CustomerID=${CustomerID}`
        )
        .then(() => {
          const searchResult = state.searchResultState.results;

          for (let i = 0; i < searchResult.length; i++) {
            if (searchResult[i].CustomerID === CustomerID) {
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
            batchActions([hideLoading(), snackBarFail('Failed to Update')])
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

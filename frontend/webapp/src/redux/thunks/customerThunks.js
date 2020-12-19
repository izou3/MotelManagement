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

export const updateCustomer = (updatedCust) => async (dispatch, getState) =>
  // Check auth state of cookies or from tokenExpiration Middleware and don't execute
  // remainder of auth if not authenticated
  axios
    .get('/validAccess')
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;

      dispatch(showLoading());
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
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );

export const updateBlackListCust = (updatedCust) => async (
  dispatch,
  getState
) => {
  dispatch(showLoading());
  return axios
    .get('/validAccess')
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
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );
};

// Add and delete Blacklist Customers from Search Result
export const addBlackListCust = (newCust) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get('/validAccess')
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
    })
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );
};

export const removeBlackListCust = (id) => async (dispatch, getState) => {
  dispatch(showLoading());
  axios
    .get('/validAccess')
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;

      return axios
        .delete(
          `${Config.apiHost}/api/blacklist?HotelID=${HotelID}&BookingID=${id}`
        )
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
            batchActions([hideLoading(), snackBarFail('Failed to Update')])
          );
        });
    })
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );
};

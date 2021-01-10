import { batchActions } from 'redux-batched-actions';

// Config
import config from '../../config';
import axios from './axios';

import {
  showLoading,
  snackBarFail,
  snackBarSuccess,
  hideLoading,
} from '../actions/actions';

import { loadAllStaff, loadStaffFail } from '../actions/staffActions';

import { loadFormFail } from '../actions/formActions';

import { logoutUser } from '../actions/authActions';

const Config = config[process.env.NODE_ENV || 'development'];

/**
 * Add New Staff
 */
export const createNewStaff = (newStaff) => async (dispatch, getState) => {
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
        .post(`${Config.apiHost}/api/staff?HotelID=${HotelID}`, {
          ...newStaff,
          HotelID,
        })
        .then((response) => {
          const currentStaff = state.staffState.staff;
          currentStaff.push(response.data);
          dispatch(
            batchActions([
              loadAllStaff(currentStaff),
              snackBarSuccess('Successfully Added Staff'),
              loadFormFail(),
              hideLoading(),
            ])
          );
        })
        .catch((err) => {
          const errMesage = err.response
            ? err.response.data.message
            : 'Failed to Create User';
          dispatch(batchActions([snackBarFail(errMesage), hideLoading()]));
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

/**
 * load All Staff Members
 */
export const getAllStaff = () => async (dispatch, getState) => {
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
        .get(`${Config.apiHost}/api/staff?HotelID=${HotelID}`)
        .then((response) => {
          dispatch(batchActions([loadAllStaff(response.data), hideLoading()]));
        })
        .catch((err) => {
          const errMessage =
            err.response.status === 500
              ? 'Failed to Connect. Please Refresh!'
              : err.response.data.message;
          dispatch(
            batchActions([
              loadStaffFail(),
              snackBarFail(errMessage),
              hideLoading(),
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

/**
 * Update Staff Member with Matching Username
 */
export const updateStaff = (updatedObj) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;

      const currentStaff = state.staffState.staff;
      return axios
        .put(`${Config.apiHost}/api/staff?HotelID=${HotelID}`, updatedObj)
        .then((response) => {
          const updatedStaff = response.data;
          for (let i = 0; i < currentStaff.length; i++) {
            if (currentStaff[i].username === updatedStaff.username) {
              currentStaff[i] = updatedStaff;
              break;
            }
          }
          dispatch(
            batchActions([
              loadAllStaff(currentStaff),
              snackBarSuccess('Updated Successfully'),
              loadFormFail(),
              hideLoading(),
            ])
          );
        })
        .catch((err) => {
          dispatch(
            batchActions([
              snackBarFail(err.response.data.message),
              hideLoading(),
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

/**
 * Delete Staff
 */
export const deleteStaff = (username) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      const currentStaff = state.staffState.staff;
      return axios
        .delete(
          `${Config.apiHost}/api/staff?HotelID=${HotelID}&username=${username}`
        )
        .then(() => {
          for (let i = 0; i < currentStaff.length; i++) {
            if (currentStaff[i].username === username) {
              currentStaff.splice(i, 1);
              break;
            }
          }
          dispatch(
            batchActions([
              loadAllStaff(currentStaff),
              snackBarSuccess('Deleted Successfully'),
              loadFormFail(),
              hideLoading(),
            ])
          );
        })
        .catch((err) => {
          dispatch(
            batchActions([
              snackBarFail(err.response.data.message),
              hideLoading(),
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

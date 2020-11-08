import axios from 'axios';
import { batchActions } from 'redux-batched-actions';

import {
  showLoading,
  snackBarFail,
  snackBarSuccess,
  hideLoading,
} from '../actions/actions';

import {
  loadAllStaff,
  loadStaffFail,
} from '../actions/staffActions';

import { loadFormFail } from '../actions/formActions';

import { logoutUser } from '../actions/authActions';

/**
 * Add New Staff
 */
export const createNewStaff = (newStaff) => async (dispatch, getState) => {
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
  axios.post('/user', newStaff)
    .then((response) => {
      const currentStaff = state.staffState.staff;
      currentStaff.push(response.data);
      dispatch(
        batchActions([
          loadAllStaff(currentStaff),
          snackBarSuccess('Successfully Added Staff'),
          loadFormFail(),
          hideLoading()
        ])
      );
    })
    .catch((err) => {
      const errMesage = err.response ? err.response.data.message : 'Failed to Create User';
      dispatch(
        batchActions([
          snackBarFail(errMesage),
          hideLoading()
        ])
      );
    });
}

/**
 * load All Staff Members
 */
export const getAllStaff = () => async (dispatch, getState) => {
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
  return axios.get('/user')
    .then((response) => {
      dispatch(
        batchActions([
          loadAllStaff(response.data),
          hideLoading()
        ])
      );
    })
    .catch((err) => {
      const errMessage = err.response.status === 500 ?
        'Failed to Connect. Please Refresh!' : err.response.data.message;
      dispatch(
        batchActions([
          loadStaffFail(),
          snackBarFail(errMessage),
          hideLoading()
        ])
      );
    });
}

/**
 * Update Staff Member with Matching Username
 */
export const updateStaff = (updatedObj) => async (dispatch, getState) => {
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

  const currentStaff = state.staffState.staff;
  dispatch(showLoading());
  return axios.put('/user', updatedObj)
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
          hideLoading()
        ])
      );
    })
    .catch((err) => {
      dispatch(
        batchActions([
          snackBarFail(err.response.data.message),
          hideLoading()
        ])
      );
    });
}

/**
 * Delete Staff
 */
export const deleteStaff = (username) => async (dispatch, getState) => {
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

  const currentStaff = state.staffState.staff;
  dispatch(showLoading());
  axios.delete(`/user?username=${username}`)
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
          hideLoading()
        ])
      );
    })
    .catch((err) => {
      dispatch(
        batchActions([
          snackBarFail(err.response.data.message),
          hideLoading()
        ])
      );
      });
}

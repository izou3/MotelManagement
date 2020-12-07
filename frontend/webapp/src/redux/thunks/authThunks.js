import axios from 'axios';
import moment from 'moment';
import { batchActions } from 'redux-batched-actions';
import logger from '../../logger';

import { loginUser, logoutUser } from '../actions/authActions';

import {
  showLoading,
  snackBarFail,
  snackBarSuccess,
  hideLoading,
} from '../actions/actions';

import initialPageLoad from './thunks';
import { initialMaintenanceLog } from './reportThunks';

/**
 * Post Request to Login User
 */
export const loginStaff = (userInfo, redirect) => async (dispatch) => {
  dispatch(showLoading());
  axios.defaults.withCredentials = true; // Make Cookie Present in every Request Header
  return axios
    .post(`/user/login`, userInfo)
    .then((res) => {
      const { user, MotelInfo, MotelRoom } = res.data;
      const today = moment().format('YYYY-MM-DD');

      dispatch(
        batchActions([
          loginUser(user, MotelInfo, MotelRoom),
          snackBarSuccess('Successfully Logged In'),
          initialPageLoad(today),
          initialMaintenanceLog(),
          hideLoading(),
        ])
      );
      redirect(user);
    })
    .catch(() => {
      dispatch(batchActions([snackBarFail('Login Failed'), hideLoading()]));
    });
};

export const logoutStaff = (redirect) => async (dispatch) => {
  dispatch(showLoading());
  return axios
    .get(`/user/logout`)
    .then((res) => {
      logger(res);
      dispatch(
        batchActions([
          logoutUser(),
          snackBarSuccess('Successfully Logged Out!'),
          hideLoading(),
        ])
      );
      redirect();
    })
    .catch((err) => {
      logger(err);
      dispatch(
        snackBarFail('Failed to Logout. Seesion Will Expire in 30 minutes.'),
        dispatch(hideLoading())
      );
    });
};

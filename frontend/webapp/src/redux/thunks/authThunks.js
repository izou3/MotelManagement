import { batchActions } from 'redux-batched-actions';
import logger from '../../logger';

// Config
import config from '../../config';
import axios from './axios';

// Redux Actions
import { loginUser, logoutUser } from '../actions/authActions';

import {
  showLoading,
  snackBarFail,
  snackBarSuccess,
  hideLoading,
} from '../actions/actions';

const Config = config[process.env.NODE_ENV || 'development'];

/**
 * Post Request to Login User
 */
export const loginStaff = (userInfo, redirect) => async (dispatch) => {
  dispatch(showLoading());
  axios.defaults.withCredentials = true; // Make Cookie Present in every Request Header
  return axios
    .post(`${Config.apiHost}/user/login`, userInfo)
    .then((res) => {
      const { user, MotelInfo, MotelRoom } = res.data;

      // Join SocketIO Room
      // No Need to HideLoading as Thunks in batched actions
      // hide loading or will send it as part of single render
      dispatch(
        batchActions([
          { type: 'server/login', payload: user.HotelID },
          loginUser(user, MotelInfo, MotelRoom),
          snackBarSuccess('Successfully Logged In'),
        ])
      );
      redirect(user);
    })
    .catch((err) => {
      logger(err.response);
      dispatch(batchActions([snackBarFail('Login Failed'), hideLoading()]));
    });
};

export const logoutStaff = (redirect) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/user/logout`)
    .then((res) => {
      logger(res);
      const state = getState();
      const { HotelID } = state.authState.user;

      dispatch(
        batchActions([
          { type: 'server/logout', payload: HotelID },
          logoutUser(),
          snackBarSuccess('Successfully Logged Out!'),
          hideLoading(),
        ])
      );
      redirect();
    })
    .catch((err) => {
      logger(err);
      return dispatch(
        batchActions([
          snackBarFail('Failed to Logout. Sesion Will Expire in 30 minutes.'),
          hideLoading(),
        ])
      );
    });
};

export const expireStaff = () => async () =>
  axios.get(`${Config.apiHost}/user/logout`);

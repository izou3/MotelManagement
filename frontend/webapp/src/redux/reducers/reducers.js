import {
  SNACKBAR_FAIL,
  SNACKBAR_SUCCESS,
  SNACKBAR_CLOSE,
  SHOW_LOADING,
  HIDE_LOADING,
} from '../actions/actions';

import { LOGIN_USER, LOGOUT_USER } from '../actions/authActions';

const initialAuthState = {
  isAuthenticated: false,
  expire: 0,
  user: {},
};

export const authState = (state = initialAuthState, action) => {
  const { type, payload } = action;

  switch (type) {
    case LOGIN_USER: {
      const { userInfo } = payload;
      return {
        ...state,
        isAuthenticated: true,
        expire: userInfo.exp,
        user: userInfo,
      };
    }
    case LOGOUT_USER: {
      return {
        ...state,
        isAuthenticated: false,
        expire: 0,
        user: {},
      };
    }
    default: {
      return state;
    }
  }
};

const initialSnackBarState = {
  open: false,
  alert: 'success',
  message: '',
};

export const snackBarState = (state = initialSnackBarState, action) => {
  const { type, payload } = action;

  switch (type) {
    case SNACKBAR_FAIL: {
      const { message } = payload;
      return {
        ...state,
        open: true,
        alert: 'error',
        message,
      };
    }
    case SNACKBAR_SUCCESS: {
      const { message } = payload;
      return {
        ...state,
        open: true,
        alert: 'success',
        message,
      };
    }
    case SNACKBAR_CLOSE: {
      return {
        ...state,
        open: false,
      };
    }
    default: {
      return state;
    }
  }
};

export const loadingState = (state = { isLoading: false }, action) => {
  const { type } = action;

  switch (type) {
    case SHOW_LOADING: {
      return {
        ...state,
        isLoading: true,
      };
    }
    case HIDE_LOADING: {
      return {
        ...state,
        isLoading: false,
      };
    }
    default: {
      return state;
    }
  }
};

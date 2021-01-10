import { createStore, combineReducers, applyMiddleware } from 'redux';
import { batchDispatchMiddleware } from 'redux-batched-actions';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import io from 'socket.io-client';
import createSocketIoMiddleware from 'redux-socket.io';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

// Config
import config from '../config';

import { expireStaff } from './thunks/authThunks';
import { snackBarSuccess } from './actions/actions';

// Reservation States
import { info, currRes, pendRes, overRes } from './reducers/reservations';

// Reusable States
import { authState, snackBarState, loadingState } from './reducers/reducers';

// Report State
import {
  reportState,
  houseKeepingState,
  maintenanceState,
} from './reducers/report';

import formState from './reducers/form';
import searchResultState from './reducers/search';
import staffState from './reducers/staff';

const Config = config[process.env.NODE_ENV || 'development'];

const reducers = {
  authState,
  info,
  currRes,
  pendRes,
  overRes,
  formState,
  snackBarState,
  loadingState,
  searchResultState,
  reportState,
  houseKeepingState,
  maintenanceState,
  staffState,
}; // store all the reducers defined later

// SocketIO Middleware
// Admin is for namespace
const socket = io(Config.serverDomain, {
  withCredentials: true,
  secure: Config.secure,
});

const socketIoMiddleware = createSocketIoMiddleware(socket, 'server/');

/**
 * Redux middleware to log the user out if the JWT session has timed out
 * or the user has exceeded the Idle time limit.
 */
const checkTokenExpirationAndIdleMiddleware = (store) => (next) => (action) => {
  const authenticationState = store.getState().authState;
  if (
    (authenticationState.isAuthenticated &&
      authenticationState.expire < Date.now() / 1000) ||
    action.type === 'IDLE_USER'
  ) {
    // Send to next middleware in chain
    next(expireStaff());
    next({ type: 'LOGOUT_USER' });
    next({ type: 'server/logout', payload: authenticationState.user.HotelID }); // Leave Socket Room
    next(snackBarSuccess('Session Timeout! Login Again!'));
  } else {
    next(action);
  }
};

/**
 * Redux Middleware that locks the app from being accessible from
 * 00:00 to 00:02 while the system generates a new DailyReport
 */
const lockAppMiddleware = (store) => (next) => (action) => {
  const authenticationState = store.getState().authState;
  const currentDate = new Date();

  // Cannot access app from 00:00 to 00:02 while the system generates a new DailyReport
  if (currentDate.getHours() === 0 && currentDate.getMinutes() < 2) {
    if (authenticationState.isAuthenticated) {
      // Send to next middleware in chain
      next(expireStaff());
      next({ type: 'LOGOUT_USER' });
      next({
        type: 'server/logout',
        payload: authenticationState.user.HotelID,
      }); // Leave socket room
      next(snackBarSuccess('Session Timeout! Login Again!'));
    }
    // if user is not logged in, load persist state loading render
    // or snackbar is user is currently at the login page
    next(snackBarSuccess('Cannot Login At This Time'));
  } else {
    next(action);
  }
};

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2,
};

const appReducer = combineReducers(reducers);

const rootReducer = (state, action) => {
  let currState = state;
  if (action.type === 'LOGOUT_USER') {
    currState = undefined;
  }

  return appReducer(currState, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const configureStore = () => {
  if (process.env.NODE_ENV !== 'production') {
    return createStore(
      persistedReducer,
      composeWithDevTools(
        applyMiddleware(
          checkTokenExpirationAndIdleMiddleware,
          lockAppMiddleware,
          socketIoMiddleware,
          batchDispatchMiddleware,
          thunk
        )
      )
    );
  }
  return createStore(
    persistedReducer,
    applyMiddleware(
      checkTokenExpirationAndIdleMiddleware,
      lockAppMiddleware,
      socketIoMiddleware,
      batchDispatchMiddleware,
      thunk
    )
  );
};

export default configureStore;

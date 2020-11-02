import { createStore, combineReducers, applyMiddleware } from 'redux';
import { enableBatching } from 'redux-batched-actions';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import { snackBarSuccess } from './actions/actions';

// Reservation States
import { info, currRes, pendRes, overRes } from './reducers/reservations';

// Reusable States
import {
  authState,
  snackBarState,
  loadingState,
} from './reducers/reducers';

// Report State
import {
  reportState,
  houseKeepingState,
  maintenanceState,
} from './reducers/report';

import formState from './reducers/form';
import searchResultState from './reducers/search';
import staffState from './reducers/staff';

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

// If JWT Session Has Timed Out, on next action dispatch, logout User
const checkTokenExpirationMiddleware = (store) => (next) => (action) => {
  const authenticationState = store.getState().authState;
  if (
    authenticationState.isAuthenticated &&
    authenticationState.expire < Date.now() / 1000
  ) {
    next({ type: 'LOGOUT_USER' });
    next(snackBarSuccess('Session Timeout! Login Again!'));
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

const configureStore = () =>
  createStore(
    enableBatching(persistedReducer),
    composeWithDevTools(applyMiddleware(checkTokenExpirationMiddleware, thunk))
  );

export default configureStore;

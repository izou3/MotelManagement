/**
 * Module Dependencies
 */
import Axios from 'axios'; // for Axios.all Requests which wont use axios.create
import moment from 'moment';
import FileDownload from 'js-file-download';
import { batchActions } from 'redux-batched-actions';

// Config
import axios from './axios';
import config from '../../config';

// Socket Actions
import {
  updateSocketHouseKeepingReport,
  updateSocketReport,
  updateSocketReportRefund,
} from '../actions/socket/report';

import { loadSocketCurrResSuccess } from '../actions/socket/reservation';

// Regular Actions
import {
  showLoading,
  hideLoading,
  snackBarSuccess,
  snackBarFail,
} from '../actions/actions';

import {
  loadHouseKeepingReport,
  updateHouseKeepingReport,
  loadHouseKeepingReportFail,
  loadReportFail,
  loadReport,
  updateReport,
  updateReportRefund,
  initialLoadMaintenanceLog,
  loadMaintenanceLogOnSearch,
  loadMaintenanceLog,
  addNewMaintenanceLog,
  loadMaintenanceFail,
} from '../actions/reportActions';

import { logoutUser } from '../actions/authActions';

const Config = config[process.env.NODE_ENV || 'development'];

/**
 * Thunks for Daily Report
 */
export const loadDailyReport = (date) => async (dispatch, getState) => {
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
        .get(
          `${Config.apiHost}/api/dailyreport?HotelID=${HotelID}&date=${date}`
        )
        .then((res) => {
          const stays = res.data.Stays;
          const refund = res.data.Refund;
          const data = [];

          Object.entries(stays).forEach(([key, value]) => {
            // Get Rid of ID from Mongo Document
            // And last remaining key
            if (key === '_id' || key === '126') return;
            data.push({
              BookingID: value.Room.BookingID ? value.Room.BookingID : 0,
              RoomID: key,
              type: value.Room.type,
              startDate: value.Room.startDate
                ? moment(value.Room.startDate.substring(0, 10)).toDate()
                : '',
              endDate: value.Room.endDate
                ? moment(value.Room.endDate.substring(0, 10)).toDate()
                : '',
              paid: !!value.Room.paid,
              rate: value.Room.rate ? value.Room.rate : '',
              tax: value.Room.tax ? value.Room.tax : '',
              notes: value.Room.notes ? value.Room.notes : '',
              payment: value.Room.payment ? value.Room.payment : '',
              initial: value.Room.initial ? value.Room.initial : '',
            });
          });

          dispatch(
            batchActions([
              loadReport(date, data, refund),
              hideLoading(),
              snackBarSuccess('Daily Report Loaded Successfully'),
            ])
          );
        })
        .catch(() => {
          dispatch(
            batchActions([
              loadReportFail(),
              hideLoading(),
              snackBarFail('Daily Report Failed to Load'),
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

export const updateDailyReport = (date, data) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get('/validAccess')
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      const { report } = state.reportState;
      const current = state.currRes.reservation;
      return axios
        .put(
          `${Config.apiHost}/api/dailyreport?HotelID=${HotelID}&date=${date}`,
          data
        )
        .then((result) => {
          report[parseInt(data.RoomID, 10) - 101] = data;
          current[parseInt(data.RoomID, 10) - 101] = result.data;

          // Date is in YYYY-MM-DD Format
          const today = moment().format('YYYY-MM-DD');
          if (moment(date).isSame(today, 'day')) {
            // Emit socket event to update all other clients
            dispatch(
              batchActions([
                loadSocketCurrResSuccess(HotelID, current),
                updateSocketReport(HotelID, report),
                hideLoading(),
                snackBarSuccess('Updated Successfully'),
              ])
            );
          } else {
            // Emit Update Event just for this client as
            // date is different from current
            dispatch(
              batchActions([
                loadSocketCurrResSuccess(HotelID, current),
                updateReport(report),
                hideLoading(),
                snackBarSuccess('Updated Successfully'),
              ])
            );
          }
        })
        .catch((err) => {
          // One Error is Updating Report on a Record that has already checked out
          const errorMessage = err.response.data.message
            ? err.response.data.message
            : 'Failed to Update';
          dispatch(snackBarFail(errorMessage));
          dispatch(hideLoading());
        });
    })
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );
};

export const updateDailyReportRefund = (refund) => async (
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
        .put(
          `${Config.apiHost}/api/dailyreport/refund?HotelID=${HotelID}`,
          refund
        )
        .then(() => {
          // Date is in refund object body in YYYY-MM-DD format
          const today = moment().format('YYYY-MM-DD');
          if (moment(today).isSame(refund.date, 'day')) {
            return dispatch(
              batchActions([
                updateSocketReportRefund(HotelID, refund),
                hideLoading(),
                snackBarSuccess('Updated Successfully'),
              ])
            );
          }
          return dispatch(
            batchActions([
              updateReportRefund(refund),
              hideLoading(),
              snackBarSuccess('Updated Successfully'),
            ])
          );
        })
        .catch(() =>
          dispatch(
            batchActions([
              hideLoading(),
              snackBarFail('Failed to Update Refund'),
            ])
          )
        );
    })
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );
};

/**
 * Thunks for Housekeeping Report
 */

// Load The HouseKeeping Report Sheet
export const loadHouseKeepingReportOnSearch = (date) => async (
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
        .get(
          `${Config.apiHost}/api/dailyreport?HotelID=${HotelID}&date=${date}`
        )
        .then((res) => {
          const stays = res.data.Stays;
          const data = [];

          Object.entries(stays).forEach(([key, value]) => {
            if (key === '_id' || key === '126') return;
            data.push({
              RoomID: key,
              status: value.HouseKeeping.status
                ? value.HouseKeeping.status
                : 'C',
              type: value.HouseKeeping.type ? value.HouseKeeping.type : 'W',
              houseKeeper: value.HouseKeeping.houseKeeper
                ? value.HouseKeeping.houseKeeper
                : '',
              notes: value.HouseKeeping.notes ? value.HouseKeeping.notes : '',
            });
          });

          dispatch(
            batchActions([
              loadHouseKeepingReport(date, data),
              hideLoading(),
              snackBarSuccess('HouseKeeping Loaded Successfully'),
            ])
          );
        })
        .catch(() => {
          dispatch(
            batchActions([
              loadHouseKeepingReportFail(date),
              hideLoading(),
              snackBarFail('Housekeeping Report Failed to Load'),
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

// Update A Record in the HouseKeeping Sheet
export const updateHouseKeepingReportOnAction = (data) => async (
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

      const { houseKeepingReport } = state.houseKeepingState;
      const { date } = state.houseKeepingState;
      return axios
        .put(
          `${Config.apiHost}/api/dailyreport/housekeeping?HotelID=${HotelID}&date=${date}`,
          data
        )
        .then(() => {
          houseKeepingReport[parseInt(data.RoomID, 10) - 101] = data;

          // Date is in YYYY-MM-DD Format
          const today = moment().format('YYYY-MM-DD');
          if (moment(today).isSame(date, 'day')) {
            // Emit Update Event for all connected clients
            dispatch(
              batchActions([
                updateSocketHouseKeepingReport(HotelID, houseKeepingReport),
                hideLoading(),
                snackBarSuccess('Updated Successfully'),
              ])
            );
          } else {
            // Emit Update Event just for this client as
            // date is different from current
            dispatch(
              batchActions([
                updateHouseKeepingReport(houseKeepingReport),
                hideLoading(),
                snackBarSuccess('Updated Successfully'),
              ])
            );
          }
        })
        .catch(() => {
          dispatch(
            batchActions([
              loadHouseKeepingReportFail(),
              hideLoading(),
              snackBarFail('Failed to Update!'),
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

/**
 * Thunks for Maintenance Log
 */
export const initialMaintenanceLog = () => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get('/validAccess')
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      const requestOne = axios.get(
        `${Config.apiHost}/api/maintenance?HotelID=${HotelID}&name=General`
      ); // Get Maintenance Log
      const requestTwo = axios.get(
        `${Config.apiHost}/api/maintenance?HotelID=${HotelID}`
      ); // Get Names

      // Use separate Axios instance in order to use Axios.all requests. Otherwise
      // axio.create(...).all(...) will throw an error.
      return Axios.all([requestOne, requestTwo])
        .then(
          Axios.spread((...responses) => {
            const responseOne = responses[0];
            const responseTwo = responses[1];

            if (responseTwo.data.length === 0) throw new Error();
            dispatch(
              batchActions([
                initialLoadMaintenanceLog(responseTwo.data, responseOne.data),
                hideLoading(),
                snackBarSuccess('Maintenance Loaded Successfully'),
              ])
            );
          })
        )
        .catch(() => {
          dispatch(
            batchActions([
              loadMaintenanceFail(),
              hideLoading(),
              snackBarFail('Maintenance Failed to Load'),
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

export const addMaintenanceLog = (name) => async (dispatch, getState) => {
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
        .post(
          `${Config.apiHost}/api/maintenance?HotelID=${HotelID}&name=${name}`
        )
        .then((response) => {
          if (response.data.length === 0) throw new Error();
          const currentNames = state.maintenanceState.logSearchNames;
          currentNames.push({
            _id: response.data._id,
            Name: response.data.Name,
          });

          dispatch(
            batchActions([
              addNewMaintenanceLog(name, currentNames, response.data.blankLog),
              hideLoading(),
              snackBarSuccess('New Maintenance Log Added Successfully'),
            ])
          );
        })
        .catch(() => {
          dispatch(
            batchActions([
              loadMaintenanceFail(),
              hideLoading(),
              snackBarFail('Maintenance Failed to Load'),
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

export const searchMaintenanceLog = (name) => async (dispatch, getState) => {
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
        .get(
          `${Config.apiHost}/api/maintenance?HotelID=${HotelID}&name=${name}`
        )
        .then((response) => {
          if (response.data.length === 0) throw new Error();

          dispatch(
            batchActions([
              loadMaintenanceLogOnSearch(name, response.data),
              hideLoading(),
              snackBarSuccess(`${name} Loaded Successfully`),
            ])
          );
        })
        .catch(() => {
          dispatch(
            batchActions([
              loadMaintenanceFail(),
              hideLoading(),
              snackBarFail('Maintenance Failed to Load'),
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

// Thunks for Individual Maintenance Log Entries
export const addLogEntry = (name, field, newEntry) => async (
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
        .post(
          `${Config.apiHost}/api/maintenance/logEntry?HotelID=${HotelID}&name=${name}&field=${field}`,
          newEntry
        )
        .then((newMaintenanceLog) =>
          dispatch(
            batchActions([
              loadMaintenanceLog(newMaintenanceLog.data),
              hideLoading(),
              snackBarSuccess('New Maintenance Log Added Successfully'),
            ])
          )
        )
        .catch(() => {
          dispatch(
            batchActions([hideLoading(), snackBarFail('Failed to Add Entry')])
          );
        });
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          snackBarSuccess('Timeout! Please Log Back In'),
        ])
      )
    );
};

export const updateLogEntry = (name, field, updatedEntry) => async (
  dispatch,
  getState
) => {
  dispatch(showLoading());
  return axios
    .get('/validAccess')
    .then(async () => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      dispatch(showLoading());
      return axios
        .put(
          `${Config.apiHost}/api/maintenance/logEntry?HotelID=${HotelID}&name=${name}&field=${field}`,
          updatedEntry
        )
        .then((updatedMaintenanceLog) =>
          dispatch(
            batchActions([
              loadMaintenanceLog(updatedMaintenanceLog.data),
              hideLoading(),
              snackBarSuccess('Updated Successfully'),
            ])
          )
        )
        .catch(() => {
          dispatch(
            batchActions([
              hideLoading(),
              snackBarFail('Maintenance Failed to Load'),
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

export const deleteLogEntry = (name, field, ID) => async (
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
        .delete(
          `${Config.apiHost}/api/maintenance/logEntry?HotelID=${HotelID}&name=${name}&field=${field}&entryID=${ID}`
        )
        .then((deletedMaintenanceLog) =>
          dispatch(
            batchActions([
              loadMaintenanceLog(deletedMaintenanceLog.data),
              hideLoading(),
              snackBarSuccess('Deleted Successfully'),
            ])
          )
        )
        .catch(() => {
          dispatch(
            batchActions([
              hideLoading(),
              snackBarFail('Maintenance Failed to Load'),
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

/**
 * Thunk for Generating Tax Report
 */
export const generateTaxReport = (MonthID, YearID) => async (
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
      const { Abbreviation } = state.authState.motel;
      return axios
        .get(
          `${Config.apiHost}/api/dailyreport/tax?HotelID=${HotelID}&MonthID=${MonthID}&YearID=${YearID}`
        )
        .then((response) => {
          const date = moment().format('MM-YYYY');
          FileDownload(response.data, `${Abbreviation}_TaxReport_${date}.csv`);
          dispatch(
            batchActions([
              hideLoading(),
              snackBarSuccess('Downloaded Successfully in your Browser'),
            ])
          );
        })
        .catch(() => {
          dispatch(
            batchActions([
              hideLoading(),
              snackBarFail('Failed to Generate Tax Report'),
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

/**
 * Module Dependencies
 */
import axios from 'axios';
import moment from 'moment';
import FileDownload from 'js-file-download';
import { batchActions } from 'redux-batched-actions';

import {
  loadCurrResSuccess,
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
  addNewMaintenanceLog,
  loadMaintenanceLog,
  loadMaintenanceFail,
} from '../actions/reportActions';

import { logoutUser } from '../actions/authActions';

/**
 * Thunks for General Report
 * @param {*} date
 */

/**
 * Thunks for Daily Report
 */
export const loadDailyReport = (date) => async (dispatch, getState) => {
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
  return axios
    .get(`/api/dailyreport?date=${date}`)
    .then((res) => {
      const stays = res.data.Stays;
      const refund = res.data.Refund;
      const data = [];

      Object.entries(stays).forEach(([key, value]) => {
        // Get Rid of ID from Mongo Document
        if (key === '_id') return;
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
          payment: value.Room.payment ? value.Room.payment: '',
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
};

export const updateDailyReport = (date, data) => async (
  dispatch, getState
) => {
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

  const { report } = state.reportState;
  const current = state.currRes.reservation;

  // Generate Proper CheckIn and CheckOut Dates
  data.startDate = moment(data.startDate).format('YYYY-MM-DDT12:00:00[Z]');
  data.endDate = moment(data.endDate).format(
    'YYYY-MM-DDT12:00:00[Z]'
  );

  dispatch(showLoading());
  return axios
    .put(`/api/dailyreport?date=${date}`, data)
    .then((result) => {
      report[parseInt(data.RoomID, 10) - 101] = data;
      current[parseInt(data.RoomID, 10) - 101] = result.data;

      dispatch(
        batchActions([
          loadCurrResSuccess(current),
          updateReport(report),
          hideLoading(),
          snackBarSuccess('Updated Successfully'),
        ])
      );
    })
    .catch((err) => {
      const errorMessage =
        err.response.data.message ? err.response.data.message : 'Failed to Update';
      dispatch(snackBarFail(errorMessage));
      dispatch(hideLoading());
    });
};

export const updateDailyReportRefund = (refund) => async (
  dispatch, getState
) => {

  axios.get('/validAccess')
    .catch(() => {
      return dispatch(
        batchActions([
          logoutUser(),
          snackBarSuccess('UnAuthorized Access')
        ])
      );
    });

  const state =getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }

  dispatch(showLoading());
  return axios
    .put(`/api/dailyreport/refund`, refund)
    .then(() => {
      dispatch(
        batchActions([
          updateReportRefund(refund),
          hideLoading(),
          snackBarSuccess('Updated Successfully'),
        ])
      );
    })
    .catch((err) => {
      const errorMessage =
        err.response.data.length !== 0 ? err.response.data : 'Failed to Update';
      dispatch(batchActions([hideLoading(), snackBarFail(errorMessage)]));
    });
};

/**
 * Thunks for Housekeeping Report
 */

// Load The HouseKeeping Report Sheet
export const loadHouseKeepingReportOnSearch = (date) => async (
  dispatch, getState
) => {

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
  return axios
    .get(`/api/dailyreport?date=${date}`)
    .then((res) => {
      const stays = res.data.Stays;
      const data = [];

      Object.entries(stays).forEach(([key, value]) => {
        if (key === '_id') return;
        data.push({
          RoomID: key,
          status: value.HouseKeeping.status ? value.HouseKeeping.status : 'C',
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
          loadHouseKeepingReportFail(),
          hideLoading(),
          snackBarFail('Housekeeping Report Failed to Load'),
        ])
      );
    });
};

// Update A Record in the HouseKeeping Sheet
export const updateHouseKeepingReportOnAction = (data) => async (
  dispatch,
  getState
) => {
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

  const { houseKeepingReport } = state.houseKeepingState;
  const { date } = state.houseKeepingState;

  dispatch(showLoading());
  return axios
    .put(`/api/dailyreport/housekeeping?date=${date}`, data)
    .then(() => {
      houseKeepingReport[parseInt(data.RoomID, 10) - 101] = data;

      dispatch(
        batchActions([
          updateHouseKeepingReport(houseKeepingReport),
          hideLoading(),
          snackBarSuccess('Updated Successfully'),
        ])
      );
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
};

/**
 * Thunks for Maintenance Log
 */
export const initialMaintenanceLog = () => async (dispatch, getState) => {
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
  const requestOne = axios.get(`/api/maintenance?name=General`); // Get Maintenance Log
  const requestTwo = axios.get(`/api/maintenance`); // Get Names

  return axios
    .all([requestOne, requestTwo])
    .then(
      axios.spread((...responses) => {
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
};

export const addMaintenanceLog = (name) => async (dispatch, getState) => {
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
  return axios
    .post(`/api/maintenance?name=${name}`)
    .then((response) => {
      if (response.data.length === 0) throw new Error();
      const currentNames = state.maintenanceState.logSearchNames;
      currentNames.push({
        _id: response.data._id,
        Name: response.data.Name,
      });

      delete response.data.Name;
      delete response.data._id;
      delete response.data.__v;

      dispatch(
        batchActions([
          addNewMaintenanceLog(name, currentNames, response.data),
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
};

export const searchMaintenanceLog = (searchID) => async (dispatch, getState) => {
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
  return axios
    .get(`/api/maintenance?id=${searchID}`)
    .then((response) => {
      if (response.data.length === 0) throw new Error();
      const name = response.data.Name;

      delete response.data.Name;

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
};

// Thunks for Individual Maintenance Log Entries
export const addLogEntry = (name, field, newEntry) => async (dispatch, getState) => {
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
  return axios
    .post(`/api/maintenance/logEntry?name=${name}&field=${field}`, newEntry)
    .then((newMaintenanceLog) => {
      dispatch(
        batchActions([
          loadMaintenanceLog(newMaintenanceLog.data),
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
};

export const updateLogEntry = (name, field, updatedEntry) => async (dispatch, getState) => {
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
  return axios
    .put(`/api/maintenance/logEntry?name=${name}&field=${field}`, updatedEntry)
    .then((updatedMaintenanceLog) => {
      dispatch(
        batchActions([
          loadMaintenanceLog(updatedMaintenanceLog.data),
          hideLoading(),
          snackBarSuccess('Updated Successfully'),
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
};

export const deleteLogEntry = (name, field, ID) => async (dispatch, getState) => {
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
  return axios
    .delete(
      `/api/maintenance/logEntry?name=${name}&field=${field}&entryID=${ID}`
    )
    .then((deletedMaintenanceLog) => {
      dispatch(
        batchActions([
          loadMaintenanceLog(deletedMaintenanceLog.data),
          hideLoading(),
          snackBarSuccess('Deleted Successfully'),
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
};

/**
 * Thunk for Generating Tax Report
 */
export const generateTaxReport = (MonthID, YearID) => async (dispatch, getState) => {
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
  axios.get(`/api/dailyreport/tax?MonthID=${MonthID}&YearID=${YearID}`)
    .then((response) => {
      const date = moment().format('MM-YYYY');
      FileDownload(response.data, `TaxReport_${date}.csv`);
      dispatch(
        batchActions([
          hideLoading(),
          snackBarSuccess('Downloaded Successfully in your Browser'),
        ])
      );
    })
    .catch((err) => {
      console.log(err);
      dispatch(
        batchActions([
          hideLoading(),
          snackBarFail('Failed to Generate Tax Report'),
        ])
      );
    });
}

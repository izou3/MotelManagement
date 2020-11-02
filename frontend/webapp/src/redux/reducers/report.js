import moment from 'moment';

import {
  UPDATE_HOUSEKEEPING_REPORT,
  LOAD_HOUSEKEEPING_REPORT,
  LOAD_HOUSEKEEPING_REPORT_FAIL,
  LOAD_REPORT_FAIL,
  LOAD_REPORT,
  UPDATE_REPORT,
  UPDATE_REPORT_REFUND,
  LOAD_MAINTENANCE_FAIL,
  INITIAL_LOAD_MAINTENANCE_LOG,
  LOAD_MAINTENANCE_LOG_ON_SEARCH,
  ADD_NEW_MAINTENANCE_LOG,
  LOAD_MAINTENANCE_LOG,
} from '../actions/reportActions';

const initialReportState = {
  date: moment().format('YYYY-MM-DD'),
  refundAmount: 0,
  refundComments: '',
  report: [],
};

// TODO: Make different names for Load report Fail
export const reportState = (state = initialReportState, action) => {
  const { type, payload } = action;
  switch (type) {
    case LOAD_REPORT: {
      const { date } = payload;
      const { reportData } = payload;
      const { refund } = payload;
      return {
        ...state,
        date,
        refundAmount: refund.Amount,
        refundComments: refund.Notes,
        report: reportData,
      };
    }
    case LOAD_REPORT_FAIL: {
      return {
        ...state,
        date: moment().format('YYYY-MM-DD'),
        report: [],
      };
    }
    case UPDATE_REPORT: {
      const { updatedReport } = payload;
      return {
        ...state,
        report: updatedReport,
      };
    }
    case UPDATE_REPORT_REFUND: {
      const { refund } = payload;
      return {
        ...state,
        refundAmount: refund.amount,
        refundComments: refund.notes,
      };
    }
    default: {
      return state;
    }
  }
};

const initialHouseKeepingState = {
  date: moment().format('YYYY-MM-DD'),
  houseKeepingReport: [],
};

export const houseKeepingState = (state = initialHouseKeepingState, action) => {
  const { type, payload } = action;
  switch (type) {
    case LOAD_HOUSEKEEPING_REPORT: {
      const { date } = payload;
      const { reportData } = payload;
      return {
        ...state,
        date,
        houseKeepingReport: reportData,
      };
    }
    case UPDATE_HOUSEKEEPING_REPORT: {
      const { updatedReport } = payload;
      return {
        ...state,
        houseKeepingReport: updatedReport,
      };
    }
    case LOAD_HOUSEKEEPING_REPORT_FAIL: {
      return {
        date: moment().format('YYYY-MM-DD'),
        houseKeepingReport: [],
      };
    }
    default: {
      return state;
    }
  }
};

const initialMaintenanceState = {
  logName: 'General',
  logSearchNames: [],
  MaintenanceLog: {},
}

export const maintenanceState = (state = initialMaintenanceState, action) => {
  const { type, payload } = action;
  switch (type) {
    case LOAD_MAINTENANCE_LOG: {
      const { maintenanceLog } = payload;
      return {
        ...state,
        MaintenanceLog: maintenanceLog,
      };
    }
    case INITIAL_LOAD_MAINTENANCE_LOG: {
      const { maintenanceLog } = payload;
      const { logSearchName } = payload;
      return {
        ...state,
        logName: 'General',
        logSearchNames: logSearchName,
        MaintenanceLog: maintenanceLog,
      };
    }
    case LOAD_MAINTENANCE_FAIL: {
      return {
        ...state,
        logName: 'General',
        logSearchNames: [],
        MaintenanceLog: {},
      };
    }
    case LOAD_MAINTENANCE_LOG_ON_SEARCH: {
      const { searchName } = payload;
      const { maintenanceLog } = payload;
      return {
        ...state,
        logName: searchName,
        MaintenanceLog: maintenanceLog,
      };
    }
    case ADD_NEW_MAINTENANCE_LOG: {
      const { logSearchName } = payload;
      const { name } = payload;
      const { newMaintenanceLog } = payload;
      return {
        ...state,
        logName: name,
        logSearchNames: logSearchName,
        MaintenanceLog: newMaintenanceLog,
      };
    }
    default: {
      return state;
    }
  }
};

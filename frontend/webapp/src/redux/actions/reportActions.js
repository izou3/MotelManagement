/** **************************************************************
 * Actions loading Daily Report State
 **************************************************************** */
export const LOAD_REPORT = 'LOAD_REPORT';
export const loadReport = (date, reportData, refund) => ({
  type: LOAD_REPORT,
  payload: {
    date,
    reportData,
    refund,
  },
});

export const LOAD_REPORT_FAIL = 'LOAD_REPORT_FAIL';
export const loadReportFail = () => ({
  type: LOAD_REPORT_FAIL,
});

export const UPDATE_REPORT = 'UPDATE_REPORT';
export const updateReport = (updatedReport) => ({
  type: UPDATE_REPORT,
  payload: {
    updatedReport,
  },
});

export const UPDATE_REPORT_REFUND = 'UPDATE_REPORT_REFUND';
export const updateReportRefund = (refund) => ({
  type: UPDATE_REPORT_REFUND,
  payload: {
    refund,
  },
});

export const SEARCH_REPORT = 'SEARCH_REPORT';
export const searchReport = (date) => ({
  type: SEARCH_REPORT,
  payload: {
    date,
  },
});

/** **************************************************************
 * Actions for the HouseKeepingReport State
 **************************************************************** */
export const LOAD_HOUSEKEEPING_REPORT = 'LOAD_HOUSEKEEPING_REPORT';
export const loadHouseKeepingReport = (date, reportData) => ({
  type: LOAD_HOUSEKEEPING_REPORT,
  payload: {
    date,
    reportData,
  },
});

export const UPDATE_HOUSEKEEPING_REPORT = 'UPDATE_HOUSEKEEPING_REPORT';
export const updateHouseKeepingReport = (updatedReport) => ({
  type: UPDATE_HOUSEKEEPING_REPORT,
  payload: {
    updatedReport,
  },
});

export const LOAD_HOUSEKEEPING_REPORT_FAIL = 'LOAD_HOUSEKEEPING_REPORT_FAIL';
export const loadHouseKeepingReportFail = (date) => ({
  type: LOAD_HOUSEKEEPING_REPORT_FAIL,
  payload: {
    date,
  },
});

/** **************************************************************
 * Actions loading Maintenance State
 **************************************************************** */
export const INITIAL_LOAD_MAINTENANCE_LOG = 'INITIAL_LOAD_MAINTENANCE_LOG';
export const initialLoadMaintenanceLog = (logSearchName, maintenanceLog) => ({
  type: INITIAL_LOAD_MAINTENANCE_LOG,
  payload: {
    logSearchName,
    maintenanceLog,
  },
});

export const LOAD_MAINTENANCE_FAIL = 'LOAD_MAINTENANCE_FAIL';
export const loadMaintenanceFail = () => ({
  type: LOAD_MAINTENANCE_FAIL,
});

export const LOAD_MAINTENANCE_LOG_ON_SEARCH = 'LOAD_MAINTENANCE_LOG_ON_SEARCH';
export const loadMaintenanceLogOnSearch = (searchName, maintenanceLog) => ({
  type: LOAD_MAINTENANCE_LOG_ON_SEARCH,
  payload: {
    searchName,
    maintenanceLog,
  },
});

export const ADD_NEW_MAINTENANCE_LOG = 'ADD_NEW_MAINTENANCE_LOG';
export const addNewMaintenanceLog = (
  name,
  logSearchName,
  newMaintenanceLog
) => ({
  type: ADD_NEW_MAINTENANCE_LOG,
  payload: {
    name,
    logSearchName,
    newMaintenanceLog,
  },
});

// Action for Individual Query Operations on Log Entries of a Maintenance Log
export const LOAD_MAINTENANCE_LOG = 'LOAD_MAINTENANCE_LOG';
export const loadMaintenanceLog = (maintenanceLog) => ({
  type: LOAD_MAINTENANCE_LOG,
  payload: {
    maintenanceLog,
  },
});

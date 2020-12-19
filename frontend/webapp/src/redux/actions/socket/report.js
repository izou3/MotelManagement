/**
 * Socket Actions for Reports
 */

export const SOCKET_LOAD_MAINTENANCE_LOG = 'server/2/UpdateMaintenanceLog';
export const loadSocketMaintenanceLog = (HotelID, maintenanceLog) => ({
  type: SOCKET_LOAD_MAINTENANCE_LOG,
  payload: {
    HotelID,
    maintenanceLog,
  },
});

export const SOCKET_UPDATE_HOUSEKEEPING_REPORT = 'server/2/UpdateHouseKeeping';
export const updateSocketHouseKeepingReport = (HotelID, updatedReport) => ({
  type: SOCKET_UPDATE_HOUSEKEEPING_REPORT,
  payload: {
    HotelID,
    updatedReport,
  },
});

export const SOCKET_UPDATE_REPORT = 'server/2/UpdateReport';
export const updateSocketReport = (HotelID, updatedReport) => ({
  type: SOCKET_UPDATE_REPORT,
  payload: {
    HotelID,
    updatedReport,
  },
});

export const SOCKET_UPDATE_REPORT_REFUND = 'server/2/UpdateReportRefund';
export const updateSocketReportRefund = (HotelID, refund) => ({
  type: SOCKET_UPDATE_REPORT_REFUND,
  payload: {
    HotelID,
    refund,
  },
});

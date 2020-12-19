const {
  UPDATE_REPORT,
  UPDATE_HOUSEKEEPING_REPORT,
  LOAD_MAINTENANCE_LOG,
  UPDATE_REPORT_REFUND,
} = require('../actions/Report.js');

module.exports = (param) => {
  const { admin, command, payload, logger } = param;

  if (command === 'UpdateReport') {
    const { HotelID, updatedReport } = payload;
    admin.to(HotelID).emit('action', {
      type: UPDATE_REPORT,
      payload: {
        updatedReport,
      },
    });
  } else if (command === 'UpdateHouseKeeping') {
    const { HotelID, updatedReport } = payload;
    admin.to(HotelID).emit('action', {
      type: UPDATE_HOUSEKEEPING_REPORT,
      payload: {
        updatedReport,
      },
    });
  } else if (command === 'UpdateMaintenanceLog') {
    const { HotelID, maintenanceLog } = payload;
    admin.to(HotelID).emit('action', {
      type: LOAD_MAINTENANCE_LOG,
      payload: {
        maintenanceLog,
      },
    });
  } else if (command === 'UpdateReportRefund') {
    const { HotelID, refund } = payload;
    admin.to(HotelID).emit('action', {
      type: UPDATE_REPORT_REFUND,
      payload: {
        refund,
      },
    });
  } else {
    logger.error('Unidentified Type from Event');
  }
};

/**
 * Module Dependencies
 */
const express = require('express');

const router = express.Router();

// Middlewares
const {
  ValidateDate,
  ValidateRoomRecord,
  ValidateHouseKeepingRecord,
  ValidateRefundRecord,
  ValidateTaxReportRequest,
} = require('../../../lib/middlewares/API-Validation/DailyReport');

// Commands
const Conductor = require('../../../services/conductor');

const {
  SearchDailyReport,
  UpdateDailyReportRoomRecord,
  UpdateDailyReportRefund,
  UpdateDailyReportHousekeepingRecord,
  GenerateTaxReport,
} = require('../../../services/ReportCommand/DailyReport');

module.exports = () => {
  /**
   * @route Query Operations against DailyReport Collection in MongoDB
   */
  router
    .route('/')
    /**
     * @get Read DailyReport From Collection given Date Query Params
     */
    .get(ValidateDate, async (req, res, next) => {
      const { date } = req.query;

      return Conductor.run(new SearchDailyReport(date))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    })
    /**
     * @Note Not formatting data beacseu there is a chance that Material-Table returned
     * datetypes are string which are converted incorrectly so frontend just formats the
     * datetimes into YYYY-MM-DDThh:mm:ss[Z] strings
     *
     * @put Update Record in DailyReport Collection Given the Date and req Object
     */
    .put(ValidateDate, ValidateRoomRecord, (req, res, next) => {
      const { date } = req.query;

      return Conductor.run(new UpdateDailyReportRoomRecord(date, req.body))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    })
    /**
     * ROUTE IS CURRENTLY NOT IN USE
     * @delete Remove Record from DailyReport Collection Given Date and Room Number
     */
    .delete((req, res) => {
      return res.status(404).json({ message: 'Undefined Route' });
    });

  /**
   * @route Update the Refund Record in DailyReport Collection for a given
   *        DailyReport's Date
   */
  router.route('/refund').put(ValidateRefundRecord, async (req, res, next) => {
    const { date } = req.body;
    const { amount } = req.body;
    const { notes } = req.body;

    return Conductor.run(new UpdateDailyReportRefund(date, amount, notes))
      .then((result) => {
        return res.send(result);
      })
      .catch((err) => {
        const error = new Error(err.message);
        error.status = 400;
        return next(error);
      });
  });

  /**
   * @route Query Operations for Obtaining the HouseKeeping Report
   */
  router
    .route('/housekeeping')
    .put(ValidateHouseKeepingRecord, async (req, res, next) => {
      const { date } = req.query;

      return Conductor.run(
        new UpdateDailyReportHousekeepingRecord(date, req.body)
      )
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    });

  /**
   * @route route to generate a new Tax Report
   */
  router.route('/tax').get(ValidateTaxReportRequest, async (req, res, next) => {
    const { MonthID } = req.query;
    const { YearID } = req.query;

    Conductor.run(new GenerateTaxReport(MonthID, YearID))
      .then((result) => {
        const { fileName, csv } = result;
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', `attachment; filename=${fileName}`);
        res.attachment(fileName);
        return res.send(csv);
      })
      .catch((err) => {
        const error = new Error(err.message);
        error.status = 400;
        return next(error);
      });
  });

  return router;
};

/**
 * Module Dependencies
 */
const express = require('express');
const moment = require('moment');
const debug = require('debug')('motel:http');

const router = express.Router();

// DailyReport Collection Service
const Report = require('../services/report/Report');
const HouseKeepingReport = require('../services/report/HouseKeeping');
const Tax = require('../services/report/TaxReport');

const report = new Report();
const houseKeeping = new HouseKeepingReport();

module.exports = () => {
  /**
   * @route Query Operations against DailyReport Collection in MongoDB
   */
  router
    .route('/')
    /**
     * @get Read DailyReport From Collection given Date Query Params
     */
    .get(async (req, res) => {
      const dateQuery = req.query.date;
      const dateValidation = moment(dateQuery, 'YYYY-MM-DD');

      if (!dateValidation.isValid()) {
        return res.status(400).json({ message: 'Undefined Date' });
      }
      try {
        const ReportResult = await Report.getReport(dateQuery);
        debug(ReportResult.Stays);
        if (ReportResult.length === 0) {
          throw new Error('No Report with Entered Dates');
        }
        return res.send(ReportResult);
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }
    })
    /**
     * @put Update Record in DailyReport Collection Given the Date and req Object
     */
    .put((req, res) => {
      const dateQuery = req.query.date;
      const dateValidation = moment(dateQuery, 'YYYY-MM-DD');

      if (!dateValidation.isValid()) {
        throw new Error('Undefined Date');
      } else {
        return report
          .updateGuestRecord(req.body, dateQuery)
          .then((updatedReservation) => res.send(updatedReservation))
          .catch((err) => res.status(400).json({ message: err.message }));
      }
    })
    /**
     * ROUTE IS CURRENTLY NOT IN USE
     * @delete Remove Record from DailyReport Collection Given Date and Room Number
     */
    .delete((req, res) => {
      const dateQuery = req.query.date;
      const dateValidation = moment(dateQuery, 'YYYY-MM-DD');
      const roomID = req.query.room;

      if (!dateValidation.isValid()) {
        throw new Error('Undefined Date');
      } else {
        return Report.deleteGuestRecord(dateQuery, roomID)
          .then(() => res.json({ message: 'Successfully Deleted Guest' }))
          .catch((err) => res.status(400).json({ message: err.message }));
      }
    });

  /**
   * @route Update the Refund Record in DailyReport Collection for a given
   *        DailyReport's Date
   */
  router.route('/refund').put(async (req, res) => {
    try {
      const { date } = req.body;
      const { amount } = req.body;
      const { notes } = req.body;
      const result = await Report.updateRefund(date, amount, notes);
      debug(result);
      return res.json({ message: 'Successful' });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  });

  /**
   * @route Query Operations for Obtaining the HouseKeeping Report
   */
  router.route('/housekeeping').put(async (req, res) => {
    const { date } = req.query;
    const updatedRecord = req.body;
    try {
      const result = await houseKeeping.updateHouseKeepingRecord(
        updatedRecord,
        date
      );
      return res.send(result);
    } catch (err) {
      debug(err);
      return res.status(400).json({ message: err.message });
    }
  });

  /**
   * @route route to generate a new Tax Report
   */
  router.route('/tax').get(async (req, res) => {
    const { MonthID } = req.query;
    const { YearID } = req.query;

    const TaxReport = new Tax(YearID, MonthID);
    return TaxReport.generateTaxReport()
      .then((result) => {
        const date = moment().format('MM-YYYY');
        const fileName = `TaxReport_${date}.csv`;

        const data = result[0].FinalReport;
        const csv = TaxReport.downloadTaxReport(data);
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', `attachment; filename=${fileName}`);
        res.attachment(fileName);
        return res.send(csv);
      })
      .catch((err) => {
        debug(err);
        return res.status(400).json({ message: err.message });
      });
  });

  // 404 Error Handler
  router.use((req, res, next) => {
    const error = new Error('Undefined Route');
    error.status = 404;
    next(error);
  });

  return router;
};

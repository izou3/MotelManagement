/**
 * Moduel Dependencies
 */
const express = require('express');

const router = express.Router();

// Middlewares
const {
  ValidateMaintenanceName,
  ValidateLogEntry,
  ValidateDeleteEntry,
} = require('../../../lib/middlewares/API-Validation/Maintenance');

// Commands
const Conductor = require('../../../services/conductor');

const {
  SearchMaintenanceLogByName,
  SearchAllMaintenanceLogNames,
  GenerateNewMaintenanceLog,
  DeleteMaintenanceLogByName,
  CreateMaintenanceEntry,
  UpdateMaintenanceEntry,
  DeleteMaintenanceEntry,
} = require('../../../services/ReportCommand/Maintenance');

module.exports = () => {
  /**
   * @route to add, read, and delete Maintenance Logs
   */
  router
    .route('/')
    .get(async (req, res, next) => {
      const { name } = req.query;
      if (name) {
        return Conductor.run(new SearchMaintenanceLogByName(name))
          .then((result) => {
            res.send(result);
          })
          .catch((err) => {
            const error = new Error(err.message);
            error.status = 400;
            next(error);
          });
      }
      const { HotelID } = req.query;
      return Conductor.run(new SearchAllMaintenanceLogNames(HotelID))
        .then((result) => {
          res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          next(error);
        });
    })
    .post(ValidateMaintenanceName, (req, res, next) => {
      const { name } = req.query;

      return Conductor.run(new GenerateNewMaintenanceLog(name))
        .then((result) => {
          res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          next(error);
        });
    })
    .delete(ValidateMaintenanceName, (req, res, next) => {
      const { name } = req.query;

      return Conductor.run(new DeleteMaintenanceLogByName(name))
        .then((result) => {
          res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          next(error);
        });
    });

  /**
   * @route to add, update, and delete log entries in a maintenance log
   */
  router
    .route('/logEntry')
    .post(ValidateLogEntry, (req, res, next) => {
      const newEntry = req.body;
      const { name } = req.query;
      const { field } = req.query;

      return Conductor.run(new CreateMaintenanceEntry(name, field, newEntry))
        .then((result) => {
          res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          next(error);
        });
    })
    .put(ValidateLogEntry, (req, res, next) => {
      const updatedEntry = req.body;
      const { name } = req.query;
      const { field } = req.query;

      return Conductor.run(
        new UpdateMaintenanceEntry(name, field, updatedEntry)
      )
        .then((result) => {
          res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          next(error);
        });
    })
    .delete(ValidateDeleteEntry, (req, res, next) => {
      const { entryID } = req.query;
      const { name } = req.query;
      const { field } = req.query;

      return Conductor.run(new DeleteMaintenanceEntry(name, field, entryID))
        .then((result) => {
          res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          next(error);
        });
    });

  return router;
};

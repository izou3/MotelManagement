/**
 * Moduel Dependencies
 */
const express = require('express');
const debug = require('debug')('motel:http');

const router = express.Router();

// Maintenance Service
const Maintenance = require('../services/report/Maintenance');

module.exports = () => {
  /**
   * @route to add, read, and delete Maintenance Logs
   */
  router
    .route('/')
    .get(async (req, res) => {
      const { name } = req.query;
      const { id } = req.query;
      try {
        let result;
        if (name) {
          result = await Maintenance.getMaintenanceLogByName(name);
          debug(result);
          res.send(result);
        } else if (id) {
          result = await Maintenance.getMaintenanceLogByID(id);
          res.send(result);
        } else {
          result = await Maintenance.getMaintenanceLogNames();
          res.send(result);
        }
      } catch (err) {
        debug(err);
        res.status(400).json({ message: err.message });
      }
    })
    .post((req, res) => {
      const { name } = req.query;
      debug(name);
      Maintenance.generateNewMaintenanceLog(name)
        .then((data) => {
          debug(data);
          res.send(data);
        })
        .catch((err) => {
          debug(err);
          res.status(400).json({ message: err.message });
        });
    })
    .delete((req, res) => {
      const { name } = req.query;
      Maintenance.deleteMaintenanceLog(name)
        .then((data) => {
          debug(data);
          res.send(data);
        })
        .catch((err) => {
          debug(err);
          res.status(400).json({ message: err.message });
        });
    });

  /**
   * @route to add, update, and delete log entries in a maintenance log
   */
  router
    .route('/logEntry')
    .post((req, res) => {
      const newEntry = req.body;
      const { name } = req.query;
      const { field } = req.query;
      debug(newEntry);
      Maintenance.addIndividualLogEntry(name, field, newEntry)
        .then((data) => {
          debug(data);
          res.send(data);
        })
        .catch((err) => {
          debug(err);
          res.status(400).json({ message: err.message });
        });
    })
    .put((req, res) => {
      const updatedEntry = req.body;
      const { name } = req.query;
      const { field } = req.query;

      Maintenance.updateIndividualLogEntry(name, field, updatedEntry)
        .then((data) => {
          debug(data);
          res.send(data);
        })
        .catch((err) => {
          debug(err);
          res.status(400).json({ message: err.message });
        });
    })
    .delete((req, res) => {
      const { entryID } = req.query;
      const { name } = req.query;
      const { field } = req.query;

      Maintenance.deleteIndividualLogEntry(name, field, entryID)
        .then((data) => {
          debug(data);
          res.send(data);
        })
        .catch((err) => {
          debug(err);
          res.status(400).json({ message: err.message });
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

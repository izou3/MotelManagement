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
      try {
        let result;
        if (name) {
          result = await Maintenance.getMaintenanceLogByName(name);
          debug(result);
          return res.send(result);
        }
        result = await Maintenance.getMaintenanceLogNames();
        return res.send(result);
      } catch (err) {
        debug(err);
        return res.status(400).json({ message: err.message });
      }
    })
    .post((req, res) => {
      const { name } = req.query;
      if (!name) {
        return res
          .status(400)
          .json({ message: 'Cannot Create Log with No Name' });
      }

      debug(name);
      return Maintenance.generateNewMaintenanceLog(name)
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
      if (!name) {
        return res
          .status(400)
          .json({ message: 'Cannot Delete Sheet with No Name' });
      }
      return Maintenance.deleteMaintenanceLog(name)
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

      if (!name || !field) {
        return res
          .status(400)
          .json({ message: 'Cannot Create Log with Undefined Name' });
      }
      debug(newEntry);
      return Maintenance.addIndividualLogEntry(name, field, newEntry)
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

      if (!name || !field) {
        return res
          .status(400)
          .json({ message: 'Cannot Update Log with Undefined Name' });
      }
      return Maintenance.updateIndividualLogEntry(name, field, updatedEntry)
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

      if (!name || !field) {
        return res
          .status(400)
          .json({ message: 'Cannot Delete Log with Undefined Name' });
      }

      return Maintenance.deleteIndividualLogEntry(name, field, entryID)
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

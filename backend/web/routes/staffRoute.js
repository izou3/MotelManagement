/**
 * Module Dependencies
 */
const express = require('express');

const router = express();

// Middlewares
const {
  ValidateNewStaff,
  ValidateUpdateStaff,
  ValidateDeleteStaff,
} = require('../../middlewares/API-Validation/Staff');

// Commands
const Conductor = require('../../services/conductor');

const {
  SearchAllStaff,
  AddNewStaff,
  UpdateStaff,
  DeleteStaff,
} = require('../../services/StaffCommands/Staff');

module.exports = () => {
  /**
   * @route routes to get, add, update and delete staff members
   */
  router
    .route('/')
    .get(async (req, res, next) => {
      const { HotelID } = req.query; // Unneccssary
      return Conductor.run(new SearchAllStaff(HotelID))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    })
    .post(ValidateNewStaff, async (req, res, next) => {
      return Conductor.run(new AddNewStaff(req.body))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    })
    .put(ValidateUpdateStaff, async (req, res, next) => {
      return Conductor.run(new UpdateStaff(req.body))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    })
    .delete(ValidateDeleteStaff, async (req, res, next) => {
      const { username } = req.query;
      return Conductor.run(new DeleteStaff(username))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    });

  return router;
};

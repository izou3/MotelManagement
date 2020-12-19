/**
 * Module Dependencies
 */
const express = require('express');

const router = express.Router();

// Middlewares

const {
  FormatDataDate,
} = require('../../../lib/middlewares/API-Validation/DateFormat');

const {
  ValidateCreateCustomer,
  ValidateUpdateCustomer,
} = require('../../../lib/middlewares/API-Validation/Customers');

// Conductor
const Conductor = require('../../../services/conductor');

const {
  CreateNewCustomer,
  UpdateCustomer,
} = require('../../../services/CustomerCommands/index');

module.exports = (param) => {
  const { sqlPool } = param;

  /**
   * @route Create and Update Customers in MYSQL DD
   */
  router
    .route('/')
    /**
     * @post Create New Customer and Delete Reservation from Current and DailyReport
     */
    .post(ValidateCreateCustomer, FormatDataDate, async (req, res, next) => {
      const { roomType } = req.query;
      return Conductor.run(new CreateNewCustomer(req.body, roomType, sqlPool))
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
     * @put Update a Customer Given Data
     */
    .put(ValidateUpdateCustomer, FormatDataDate, (req, res, next) => {
      return Conductor.run(new UpdateCustomer(req.body, sqlPool))
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

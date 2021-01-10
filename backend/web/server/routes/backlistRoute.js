/**
 * Module Dependencies
 */
const express = require('express');

const router = express.Router();

const Conductor = require('../../../services/conductor');

// Middlewares
const {
  FormatDataDate,
} = require('../../../lib/middlewares/API-Validation/DateFormat.js');

const {
  ValidateNewBlackListCustomer,
} = require('../../../lib/middlewares/API-Validation/Customers');

const {
  CreateNewBlackListCustWithNoPrevRec,
  CreateNewBlackListCust,
  UpdateBlackListCust,
  DeleteBlackListCust,
} = require('../../../services/CustomerCommands/BlackList');

/**
 * Routes to Add, Update, or Delete Customers from BlackList Table in MySQL
 * @param {Object} param
 */
module.exports = (param) => {
  const { sqlPool } = param;

  router
    .route('/')
    .post(async (req, res, next) => {
      return Conductor.run(
        new CreateNewBlackListCust(
          req.body.CustomerID,
          req.body.comments,
          sqlPool
        )
      )
        .then(() => res.json({ message: 'Success' }))
        .catch((err) => {
          let error;
          if (err.message.substring(0, 9) === 'Duplicate') {
            error = new Error('Customer Already In BlackList');
          } else {
            error = new Error(err.message);
          }
          error.status = 400;
          return next(error);
        });
    })
    .put(async (req, res, next) => {
      return Conductor.run(
        new UpdateBlackListCust(req.body.CustomerID, req.body.comments, sqlPool)
      )
        .then(() => {
          return res.json({ message: 'Success' });
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    })
    .delete(async (req, res, next) => {
      const { CustomerID } = req.query;
      return Conductor.run(new DeleteBlackListCust(CustomerID, sqlPool))
        .then(() => {
          return res.json({ message: 'Success' });
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    });

  router
    .route('/NewCustomer')
    .post(
      ValidateNewBlackListCustomer,
      FormatDataDate,
      async (req, res, next) => {
        return Conductor.run(
          new CreateNewBlackListCustWithNoPrevRec(req.body, sqlPool)
        )
          .then(() => res.json({ message: 'Success' }))
          .catch((err) => {
            let error;
            if (err.message.substring(0, 9) === 'Duplicate') {
              error = new Error('Customer Already In BlackList');
            } else {
              error = new Error(err.message);
            }
            error.status = 400;
            return next(error);
          });
      }
    );

  return router;
};

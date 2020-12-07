/**
 * Module Dependencies
 */
const express = require('express');

const router = express.Router();

const Conductor = require('../../services/conductor');

const {
  CreateNewBlackListCust,
  UpdateBlackListCust,
  DeleteBlackListCust,
} = require('../../services/CustomerCommands/BlackList');

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
          req.body.BookingID,
          req.body.comments,
          sqlPool
        )
      )
        .then(() => {
          return res.json({ message: 'Success' });
        })
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
        new UpdateBlackListCust(req.body.BookingID, req.body.comments, sqlPool)
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
      const { BookingID } = req.query;
      return Conductor.run(new DeleteBlackListCust(BookingID, sqlPool))
        .then(() => {
          return res.json({ message: 'Success' });
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    });

  return router;
};

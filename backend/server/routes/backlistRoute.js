/**
 * Module Dependencies
 */
const express = require('express');
const debug = require('debug')('motel:http');

const router = express.Router();

// BlackList Service
const BlackList = require('../services/customers/Blacklist');

/**
 * Routes to Add, Update, or Delete Customers from BlackList Table in MySQL
 * @param {Object} param
 */
module.exports = (param) => {
  const { sqlPool } = param;
  const BlackListCust = new BlackList(sqlPool);

  router
    .route('/')
    .post(async (req, res) => {
      try {
        await BlackListCust.addBlacklistCustomer(req.body);
        return res.json({ message: 'Success' });
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }
    })
    .put(async (req, res) => {
      try {
        await BlackListCust.updateBlacklistCustomer(req.body);
        return res.json({ message: 'Success' });
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }
    })
    .delete(async (req, res) => {
      try {
        const ID = req.query.BookingID;
        await BlackListCust.deleteBlacklistCustomerByID(ID);
        return res.json({ message: 'Success' });
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }
    });

  // 404 Error Handler
  router.use((req, res, next) => {
    const error = new Error('Undefined Route');
    error.status = 404;
    next(error);
  });

  return router;
};

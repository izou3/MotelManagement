/**
 * Module Dependencies
 */
const express = require('express');
const debug = require('debug')('motel:http');
const moment = require('moment');

const router = express.Router();

// Customer Service
const CustomerController = require('../services/customers/Customer');

module.exports = (param) => {
  const { sqlPool } = param;
  const customer = new CustomerController(sqlPool);

  /**
   * @route Create and Update Customers in MYSQL DD
   */
  router
    .route('/')
    /**
     * @post Create New Customer and Delete Reservation from Current and DailyReport
     */
    .post(async (req, res) => {
      // eslint-disable-next-line no-restricted-globals
      if (!req.body.BookingID || isNaN(req.body.BookingID)) {
        return res.status(400).json({ message: 'Undefined BookingID' });
      }
      const date = moment().format('YYYY-MM-DD');
      const { roomType } = req.query;
      const infoArr = [];
      const indCustomerArr = [];
      const id = req.body.CustomerID;
      const yearid = req.body.YearID;
      const monthid = req.body.MonthID;
      const first = req.body.firstName;
      const last = req.body.lastName;
      const { email } = req.body;
      const phone = req.body.phone ? req.body.phone : 0;
      const state = req.body.StateID;

      const bookingid = req.body.BookingID;
      const price = req.body.pricePaid;
      const { tax } = req.body;
      const { checkIn } = req.body;
      const { checkOut } = req.body;
      const { numGuests } = req.body;
      const resID = req.body.ReservationID;
      const payID = req.body.PaymentID;
      const roomid = req.body.RoomID;
      const { comments } = req.body;

      infoArr.push(id, yearid, monthid, first, last, email, phone, state);
      indCustomerArr.push(
        bookingid,
        id,
        price,
        tax,
        checkIn,
        checkOut,
        numGuests,
        resID,
        payID,
        roomid,
        comments
      );

      try {
        // Executed the search query on CurrentReservation beacuse in case RoomID was changed on checkout
        // so need original RoomID to properly update the state on frontend
        // const result = await CurrentReservation.getCurrReservationByID(bookingid);
        const result = await customer.addNewCustomer(
          infoArr,
          indCustomerArr,
          date,
          roomid,
          roomType
        );
        return res.send(result);
      } catch (err) {
        debug(err);
        return res.status(400).json({ message: 'Failed to Check Out Guest' });
      }
    })
    /**
     * @put Update a Customer Given Data
     */
    .put((req, res) => {
      // eslint-disable-next-line no-restricted-globals
      if (!req.body.BookingID || isNaN(req.body.BookingID)) {
        return res.status(400).json({ message: 'Undefined BookingID' });
      }
      const infoArr = [];
      const indCustomerArr = [];
      const { CustomerID } = req.body;
      const first = req.body.firstName;
      const last = req.body.lastName;
      const { email } = req.body;
      const phone = req.body.phone ? req.body.phone : 0;
      const state = req.body.StateID;

      const { BookingID } = req.body;
      const price = req.body.pricePaid;
      const { tax } = req.body;
      const { checkIn } = req.body;
      const { checkOut } = req.body;
      const { numGuests } = req.body;
      const resID = req.body.ReservationID;
      const payID = req.body.PaymentID;
      const roomid = req.body.RoomID;
      const { comments } = req.body;

      infoArr.push(first, last, email, phone, state);
      indCustomerArr.push(
        price,
        tax,
        checkIn,
        checkOut,
        numGuests,
        resID,
        payID,
        roomid,
        comments
      );
      return customer
        .updateCustomer(infoArr, indCustomerArr, BookingID, CustomerID)
        .then((data) => {
          debug(data);
          if (data.affectedRows === 0) {
            throw new Error('Failed to Update');
          } else {
            return res.send(data[0]);
          }
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

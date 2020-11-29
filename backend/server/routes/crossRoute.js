/**
 * Module Dependencies
 */
const express = require('express');
const debug = require('debug')('motel:http');
const moment = require('moment');

const router = express.Router();

// Customer and Current Reservation Services
const Customer = require('../services/customers/Customer');

module.exports = (param) => {
  const { sqlPool } = param;
  const customer = new Customer(sqlPool);

  /**
   * @route Move a Reservation from Current Collection to Customer Table in MYSQL
   */
  router.route('/checkOutReservation').post(async (req, res) => {
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
        roomType
      );
      return res.send(result);
    } catch (err) {
      debug(err);
      return res.status(400).json({ message: 'Failed to Check Out Guest' });
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

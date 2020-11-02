/**
 * Module Dependencies
 */
const express = require('express');

const router = express.Router();

// Services from DBs that are being searched
const CustomerController = require('../services/customers/Customer');
const BlackList = require('../services/customers/Blacklist');
const Pending = require('../services/reservations/PendingRes');
const Current = require('../services/reservations/CurrRes');
const Delete = require('../services/reservations/DeleteRes');

module.exports = (param) => {
  const { sqlPool } = param;
  const customerController = new CustomerController(sqlPool);
  const blackListCust = new BlackList(sqlPool);

  /**
   * Reservations Search Routes
   */

  // search reservations by first name
  router.get('/reservations/firstName', async (req, res) => {
    const name = req.query.firstName;
    try {
      const pendData = await Pending.getReservationByName(name);
      const currData = await Current.getCurrReservationByName(name);
      if (pendData.length === 0 && currData.length === 0) {
        throw new Error('Failed to Find Match');
      }
      res.send(pendData.concat(currData));
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  // search reservations by BookingID
  router.get('/reservations/BookingID', async (req, res) => {
    const id = req.query.BookingID;
    try {
      const pendData = await Pending.getReservationByID(id);
      const currData = await Current.getCurrReservationByID(id);
      if (!pendData && !currData) {
        throw new Error('Failed to Find Match');
      }
      if (pendData) {
        res.send(pendData);
      } else {
        res.send(currData);
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  // search reservations by Check In Period
  router.get('/reservations/checkIn', async (req, res) => {
    const { start } = req.query;
    const { end } = req.query;
    try {
      const result = await Pending.getReservationByCheckIn(start, end);
      if (result.length === 0) {
        throw new Error('Failed to Find a Match');
      }
      res.send(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  // search reservations by Check Out Period
  router.get('/reservations/checkOut', async (req, res) => {
    const { start } = req.query;
    const { end } = req.query;
    try {
      const result = await Pending.getReservationByCheckOut(start, end);
      if (result.length === 0) {
        throw new Error('Failed to Find a Match');
      }
      res.send(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  /**
   * Delete Reservations Search Routes
   */

  // search delete reservations by first name
  router.get('/delreservations/firstName', async (req, res) => {
    const name = req.query.firstName;
    try {
      const deleteData = await Delete.getReservationByName(name);
      if (deleteData.length === 0) throw new Error('Failed to Find Match');
      res.send(deleteData);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  // search delete reservations by BookingID
  router.get('/delreservations/BookingID', async (req, res) => {
    const id = req.query.BookingID;
    try {
      const deleteData = await Delete.getReservationByID(id);
      if (!deleteData) {
        throw new Error('Failed to Find Match');
      }
      res.send(deleteData);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  // search delete reservations by Check In Period
  router.get('/delreservations/checkIn', async (req, res) => {
    const { start } = req.query;
    const { end } = req.query;
    try {
      const result = await Delete.getReservationByCheckIn(start, end);
      if (result.length === 0) {
        throw new Error('Failed to Find Match');
      }
      res.send(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  // search delete reservations by Check Out Period
  router.get('/delreservations/checkOut', async (req, res) => {
    const { start } = req.query;
    const { end } = req.query;
    try {
      const result = await Delete.getReservationByCheckOut(start, end);
      if (result.length === 0) {
        throw new Error('Failed to Find Match');
      }
      res.send(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  /** ***********************
   * Customer Search Routes
   ************************ */

  // search customers by First Name
  router.get('/customers/firstName', (req, res) => {
    const { firstName } = req.query;
    customerController
      .getIndCustomerByFirstName(firstName)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).json({ message: err.message });
      });
  });

  // search customers by BookingID
  router.get('/customers/BookingID', (req, res) => {
    const bookingid = req.query.BookingID;
    customerController
      .getIndCustomerByID(bookingid)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).json({ message: err.message });
      });
  });

  // search customers by Check In
  router.get('/customers/checkIn', (req, res) => {
    const { start } = req.query;
    const { end } = req.query;
    customerController
      .getIndCustomerByCheckIn(start, end)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        res.status(400).json({ message: err.message });
      });
  });

  // search customers by check out
  router.get('/customers/checkOut', (req, res) => {
    const { start } = req.query;
    const { end } = req.query;
    customerController
      .getIndCustomerByCheckOut(start, end)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        res.status(400).json({ message: err.message });
      });
  });

  /**
   * BlackList Search Routes
   */

  // Search Blacklist customers by first and last name
  router.get('/blacklist/name', async (req, res) => {
    const { firstName } = req.query;
    blackListCust
      .getBlacklistCustomerByName(firstName)
      .then((result) => res.json(result))
      .catch((err) => res.status(400).json({ message: err.message }));
  });

  // Search Blacklist customers by BookingID
  router.get('/blacklist/id', async (req, res) => {
    const ID = req.query.BookingID;
    blackListCust
      .getBlacklistCustomerByID(ID)
      .then((result) => res.json(result))
      .catch((err) => res.status(400).json({ message: err.message }));
  });
  return router;
};

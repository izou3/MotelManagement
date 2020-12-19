/**
 * Module Dependencies
 */
const express = require('express');
const debug = require('debug')('motel:http');

const router = express.Router();

// Middlewares:
const {
  FormatSearchDate,
} = require('../../../lib/middlewares/API-Validation/DateFormat');

const {
  ValidateSearchByName,
  ValidateSearchByBookingID,
  ValidateSearchByDate,
} = require('../../../lib/middlewares/API-Validation/Search');

// Commands
const Conductor = require('../../../services/conductor');

const {
  SearchReservationsByFirstName,
  SearchReservationsByBookingID,
  SearchReservationsByCheckIn,
  SearchReservationsByCheckOut,
  SearchDelResByFirstName,
  SearchDelResByBookingID,
  SearchDelResByCheckIn,
  SearchDelResByCheckOut,
} = require('../../../services/SearchCommands/Reservation');

const {
  SearchCustomersByBookingID,
  SearchCustomersByName,
  SearchCustomersByCheckIn,
  SearchCustomersByCheckOut,
} = require('../../../services/SearchCommands/Customer');

const {
  SearchBlackListByBookingID,
  SearchBlackListByFirstName,
} = require('../../../services/SearchCommands/BlackList');

module.exports = (param) => {
  const { sqlPool } = param;

  /**
   * Reservations Search Routes
   */

  // search reservations by first name
  router.get(
    '/reservations/firstName',
    ValidateSearchByName,
    async (req, res, next) => {
      const { firstName } = req.query;

      Conductor.run(new SearchReservationsByFirstName(firstName))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    }
  );

  // search reservations by BookingID
  router.get(
    '/reservations/BookingID',
    ValidateSearchByBookingID,
    async (req, res, next) => {
      const { BookingID } = req.query;

      return Conductor.run(new SearchReservationsByBookingID(BookingID))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    }
  );

  // search reservations by Check In Period
  router.get(
    '/reservations/checkIn',
    ValidateSearchByDate,
    FormatSearchDate,
    async (req, res, next) => {
      const { start } = req.query;
      const { end } = req.query;

      return Conductor.run(new SearchReservationsByCheckIn(start, end))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          debug(err);
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    }
  );

  // search reservations by Check Out Period
  router.get(
    '/reservations/checkOut',
    ValidateSearchByDate,
    FormatSearchDate,
    async (req, res, next) => {
      const { start } = req.query;
      const { end } = req.query;
      return Conductor.run(new SearchReservationsByCheckOut(start, end))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    }
  );

  /**
   * Delete Reservations Search Routes
   */

  // search delete reservations by first name
  router.get(
    '/delreservations/firstName',
    ValidateSearchByName,
    async (req, res, next) => {
      const { firstName } = req.query;
      return Conductor.run(new SearchDelResByFirstName(firstName))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    }
  );

  // search delete reservations by BookingID
  router.get(
    '/delreservations/BookingID',
    ValidateSearchByBookingID,
    async (req, res, next) => {
      const { BookingID } = req.query;
      return Conductor.run(new SearchDelResByBookingID(BookingID))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    }
  );

  // search delete reservations by Check In Period
  router.get(
    '/delreservations/checkIn',
    ValidateSearchByDate,
    FormatSearchDate,
    async (req, res, next) => {
      const { start } = req.query;
      const { end } = req.query;
      return Conductor.run(new SearchDelResByCheckIn(start, end))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    }
  );

  // search delete reservations by Check Out Period
  router.get(
    '/delreservations/checkOut',
    ValidateSearchByDate,
    FormatSearchDate,
    async (req, res, next) => {
      const { start } = req.query;
      const { end } = req.query;

      return Conductor.run(new SearchDelResByCheckOut(start, end))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    }
  );

  /** ***********************
   * Customer Search Routes
   ************************ */

  // search customers by First Name
  router.get('/customers/firstName', ValidateSearchByName, (req, res, next) => {
    const { firstName } = req.query;

    return Conductor.run(new SearchCustomersByName(firstName, sqlPool))
      .then((result) => {
        return res.send(result);
      })
      .catch((err) => {
        const error = new Error(err.message);
        error.status = 400;
        return next(error);
      });
  });

  // search customers by BookingID
  router.get(
    '/customers/BookingID',
    ValidateSearchByBookingID,
    (req, res, next) => {
      const { BookingID } = req.query;
      return Conductor.run(new SearchCustomersByBookingID(BookingID, sqlPool))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    }
  );

  // search customers by Check In
  router.get(
    '/customers/checkIn',
    ValidateSearchByDate,
    FormatSearchDate,
    (req, res, next) => {
      const { start } = req.query;
      const { end } = req.query;

      return Conductor.run(new SearchCustomersByCheckIn(start, end, sqlPool))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    }
  );

  // search customers by check out
  router.get(
    '/customers/checkOut',
    ValidateSearchByDate,
    FormatSearchDate,
    (req, res, next) => {
      const { start } = req.query;
      const { end } = req.query;
      return Conductor.run(new SearchCustomersByCheckOut(start, end, sqlPool))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    }
  );

  /**
   * BlackList Search Routes
   */

  // Search Blacklist customers by first and last name
  router.get(
    '/blacklist/name',
    ValidateSearchByName,
    async (req, res, next) => {
      const { firstName } = req.query;
      return Conductor.run(new SearchBlackListByFirstName(firstName, sqlPool))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    }
  );

  // Search Blacklist customers by BookingID
  router.get(
    '/blacklist/id',
    ValidateSearchByBookingID,
    async (req, res, next) => {
      const { BookingID } = req.query;
      return Conductor.run(new SearchBlackListByBookingID(BookingID, sqlPool))
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    }
  );

  return router;
};

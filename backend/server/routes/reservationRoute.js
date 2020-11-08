/**
 * Module Dependencies
 */
const express = require('express');
const debug = require('debug')('motel:http');

const router = express.Router();

// Pending, Current, and Delete Collection Services
const Pending = require('../services/reservations/PendingRes');
const Current = require('../services/reservations/CurrRes');
const Delete = require('../services/reservations/DeleteRes');

module.exports = (param) => {
  // For Pushing Jobs into Agenda Queue
  const { agenda } = param;

  /**
   * @route create, update, and delete reservations under Pending Reservation Collection
   */
  router
    .route('/PendingReservation')
    /**
     * @post Add new Reservation to Pending Collection give req Object
     */
    .post((req, res) => {
      return Pending.addNewReservation(req, agenda)
        .then(() =>
          res.json({ messgae: 'Successfully Added New Reservation!' })
        )
        .catch((err) => res.status(400).json({ message: err.message }));
    })
    /**
     * @put Update Reservation in Pending Collection given BookingID and req Object
     */
    .put(async (req, res) => {
      const { bookingid } = req.query;
      const { dateChange } = req.query;
      if (!bookingid) {
        res.status(400).json({ message: 'Undefined BookingID' });
      } else if (dateChange === 'true') {
        // CheckIn date changed beyond 48 hour threshold so move reservation from Pending to Current
        try {
          await Pending.updateToCurr(req.body);
          res.json({ message: 'Updated Successfully!' });
        } catch (err) {
          res.status(400).json({ message: err.message });
        }
      } else {
        // Regular Update without CheckIn date change
        return Pending.updateReservationByID(bookingid, req)
          .then(() => res.json({ message: 'Succesfully Updated Reservation' }))
          .catch((err) => res.status(400).json({ message: err.message }));
      }
      return null;
    })
    /**
     * @delete Move Record from Pending to Delete Collection Given BookingID
     */
    .delete(async (req, res) => {
      // Move Reservation from Pending Collection to Delete Collection
      const bookingid = req.query.BookingID;

      if (!bookingid) {
        res.status(400).json({ message: 'Undefined BookingID' });
      } else {
        try {
          await Pending.deleteReservationByID(bookingid);
          res.send({ message: 'Successfully Removed Reservation' });
        } catch (err) {
          res.status(400).json({ message: 'Failed to Remove Reservation' });
        }
      }
    });

  /**
   * @route Get, Create, update, and delete Reservations from Current Reservations Collection
   */
  router
    .route('/CurrReservation')
    /**
     * @get Obtain all Reservations in Current Collection
     */
    .get(async (req, res) => {
      try {
        const data = await Current.getCurrReservation();
        res.send(data);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    })
    /**
     * @post Add new Reservation to Current Collection
     */
    .post((req, res) => {
      const { roomType } = req.query;
      return Current.addNewCurrReservation(req, roomType, agenda)
        .then((data) => {
          debug(data);
          res.send(data);
        })
        .catch((err) => {
          debug(err);
          res.status(400).json({ message: err.message });
        });
    })
    /**
     * @put Update new Reservation to Current Collection
     */
    .put(async (req, res) => {
      const { bookingid } = req.query;
      const { dateChange } = req.query;
      const { checkIn } = req.query;
      const { moveToArr } = req.query;
      const { roomType } = req.query;
      if (!bookingid) {
        res.status(400).json({ message: 'Undefined BookingID' });
      } else if (dateChange === 'true') {
        // If checkIn date changed so that it needed to be moved to Pending
        // IMPORTANT that key Checked===2
        try {
          await Current.updateToPend(req.body);
          res.send('Successfully Moved Reservation to Pending');
        } catch (err) {
          debug(err);
          res.status(400).json({ message: 'Failed to Move Reservation' });
        }
      } else if (checkIn === 'true') {
        // Update key Checked from 2 to 1
        return Current.checkInRes(bookingid, req, roomType)
          .then((updatedResult) => {
            res.send(updatedResult);
          })
          .catch((err) => {
            debug(err);
            res.status(400).json({ message: err.message });
          });
      } else if (moveToArr === 'true') {
        // Update key Checked from 1 to 2
        return Current.moveToArrivals(bookingid, req, roomType)
          .then((updatedResult) => {
            res.send(updatedResult.Stays);
          })
          .catch((err) => {
            res.status(400).json({ message: err.message });
          });
      } else {
        // Regular update for the reservation
        return Current.updateReservationByID(bookingid, req)
          .then((updatedResult) => {
            res.send(updatedResult);
          })
          .catch((err) => {
            res.status(400).json({ message: err.message });
          });
      }
      return null;
    })
    /**
     * @delete Move reservation in Current to Delete Collection
     */
    .delete((req, res) => {
      const { bookingid } = req.query;
      if (!bookingid) {
        res.status(400).json({ message: 'Undefined BookingID' });
      } else {
        return Current.deleteReservationByID(bookingid)
          .then(() => res.send('successs'))
          .catch((err) => res.status(400).json({ message: err.message }));
      }
      return null;
    });

  /**
   * @route Update, and delete reservations under the Delete Reservation Collection
   */
  router
    .route('/delreservations')
    /**
     * @update Update Reservations in Delete Collection Given Request Object
     */
    .put(async (req, res) => {
      try {
        await Delete.updateReservation(req.body);
        res.json({ message: 'Updated Successfully' });
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    })
    /**
     * @delete Pernamently Delete Reservations in Delete Collection Given BookingID
     */
    .delete(async (req, res) => {
      const ID = req.query.BookingID;
      try {
        await Delete.deleteReservationByID(ID);
        res.send({ message: 'Deleted Successfully' });
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    });

  // 404 Error Middleware
  router.use((req, res, next) => {
    const error = new Error('Undefined Route');
    error.status = 404;
    next(error);
  });

  return router;
};

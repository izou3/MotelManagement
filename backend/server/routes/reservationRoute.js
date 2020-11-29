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
      return Pending.addNewReservation(req.body, agenda)
        .then(() =>
          res.json({ message: 'Successfully Added New Reservation!' })
        )
        .catch((err) => res.status(400).json({ message: err.message }));
    })
    /**
     * @put Update Reservation in Pending Collection given BookingID and req Object
     */
    .put(async (req, res) => {
      const { BookingID } = req.query;
      const { dateChange } = req.query;
      // eslint-disable-next-line no-restricted-globals
      if (!BookingID || isNaN(BookingID)) {
        res.status(400).json({ message: 'Undefined BookingID' });
      } else if (dateChange === 'true') {
        // CheckIn date changed beyond 48 hour threshold so move reservation from Pending to Current
        try {
          await Pending.updateToCurr(req.body);
          res.json({ message: 'Succesfully Updated Reservation' });
        } catch (err) {
          res.status(400).json({ message: err.message });
        }
      } else {
        // Regular Update without CheckIn date change
        return Pending.updateReservationByID(req.body)
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
      const { BookingID } = req.query;

      // eslint-disable-next-line no-restricted-globals
      if (!BookingID || isNaN(BookingID)) {
        res.status(400).json({ message: 'Undefined BookingID' });
      } else {
        try {
          await Pending.deleteReservationByID(BookingID);
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
      const { BookingID } = req.query;
      const { dateChange } = req.query;
      const { checkIn } = req.query;
      const { moveToArr } = req.query;
      const { roomType } = req.query;

      // eslint-disable-next-line no-restricted-globals
      if (!BookingID || isNaN(BookingID)) {
        res.status(400).json({ message: 'Undefined BookingID' });
      } else if (dateChange === 'true') {
        // If checkIn date changed so that it needed to be moved to Pending
        // IMPORTANT that key Checked===2
        try {
          const result = await Current.updateToPend(req.body);
          res.send(result);
        } catch (err) {
          debug(err);
          res.status(400).json({ message: 'Failed to Move Reservation' });
        }
      } else if (checkIn === 'true') {
        // Update key Checked from 2 to 1
        return Current.checkInRes(BookingID, req.body, roomType)
          .then((updatedResult) => {
            res.send(updatedResult);
          })
          .catch((err) => {
            debug(err);
            res.status(400).json({ message: err.message });
          });
      } else if (moveToArr === 'true') {
        // Update key Checked from 1 to 2
        return Current.moveToArrivals(BookingID, req.body, roomType)
          .then((updatedResult) => {
            res.send(updatedResult);
          })
          .catch((err) => {
            res.status(400).json({ message: err.message });
          });
      } else {
        // Regular update for the reservation
        return Current.updateReservationByID(BookingID, req.body)
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
      const { BookingID } = req.query;
      // eslint-disable-next-line no-restricted-globals
      if (!BookingID || isNaN(BookingID)) {
        res.status(400).json({ message: 'Undefined BookingID' });
      } else {
        return Current.deleteReservationByID(BookingID)
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
        const result = await Delete.updateReservation(req.body);
        if (!result) throw new Error('Reservation Does Not Exist');
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
        const result = await Delete.deleteReservationByID(ID);
        if (!result) throw new Error('Reservation Does Not Exist');
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

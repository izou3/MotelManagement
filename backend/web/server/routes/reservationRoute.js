/**
 * Module Dependencies
 */
const express = require('express');

const router = express.Router();

const {
  FormatDataDate,
} = require('../../../lib/middlewares/API-Validation/DateFormat');

const {
  RequireBookingID,
  ValidateCreateReservation,
  ValidateUpdateReservation,
} = require('../../../lib/middlewares/API-Validation/Reservation');

const Conductor = require('../../../services/conductor');

const {
  CreatePendRes,
  UpdatePendRes,
  UpdatePendToCurrRes,
  DeletePendRes,
} = require('../../../services/ReservationCommands/PendingReservation');

const {
  SearchAllCurrRes,
  CreateCurrRes,
  UpdateCurrRes,
  UpdateCurrToPendRes,
  UpdateCurrToArrivals,
  CheckInCurrRes,
  DeleteCurrRes,
} = require('../../../services/ReservationCommands/CurrentReservation');

const {
  UpdateDelRes,
  DeleteDelRes,
} = require('../../../services/ReservationCommands/DeleteReservation');

module.exports = () => {
  /**
   * @route create, update, and delete reservations under Pending Reservation Collection
   */
  router
    .route('/PendingReservation')
    /**
     * @post Add new Reservation to Pending Collection give req Object
     */
    .post(ValidateCreateReservation, FormatDataDate, (req, res, next) => {
      return Conductor.run(new CreatePendRes(req.body))
        .then(() => {
          return res.json({ message: 'Successfully Added New Reservation!' });
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    })
    /**
     * @put Update Reservation in Pending Collection given BookingID and req Object
     */
    .put(ValidateUpdateReservation, FormatDataDate, async (req, res, next) => {
      const { dateChange } = req.query;

      if (dateChange === 'true') {
        // CheckIn date changed beyond 48 hour threshold so move reservation from Pending to Current
        return Conductor.run(new UpdatePendToCurrRes(req.body))
          .then(() => {
            return res.json({ message: 'Succesfully Updated Reservation' });
          })
          .catch((err) => {
            const error = new Error(err.message);
            error.status = 400;
            return next(error);
          });
      }
      // Regular Update without CheckIn date change
      return Conductor.run(new UpdatePendRes(req.body))
        .then(() => {
          return res.json({ message: 'Succesfully Updated Reservation' });
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    })
    /**
     * @delete Move Record from Pending to Delete Collection Given BookingID
     */
    .delete(RequireBookingID, async (req, res, next) => {
      // Move Reservation from Pending Collection to Delete Collection
      const { BookingID } = req.query;

      return Conductor.run(new DeletePendRes(BookingID))
        .then(() => {
          return res.json({ message: 'Successfully Removed Reservation' });
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    });

  /**
   * @route Get, Create, update, and delete Reservations from Current Reservations Collection
   */
  router
    .route('/CurrReservation')
    /**
     * @get Obtain all Reservations in Current Collection
     */
    .get(async (req, res, next) => {
      const { HotelID } = req.query; // Uneccessary to Pass This
      return Conductor.run(new SearchAllCurrRes(HotelID))
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
     * @post Add new Reservation to Current Collection
     */
    .post(ValidateCreateReservation, FormatDataDate, (req, res, next) => {
      const { roomType } = req.query;
      return Conductor.run(new CreateCurrRes(req.body, roomType))
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
     * @put Update new Reservation to Current Collection
     */
    .put(ValidateUpdateReservation, FormatDataDate, async (req, res, next) => {
      const { dateChange } = req.query;
      const { checkIn } = req.query;
      const { moveToArr } = req.query;
      const { roomType } = req.query;

      if (dateChange === 'true') {
        // If checkIn date changed so that it needed to be moved to Pending
        // IMPORTANT that key Checked===2
        return Conductor.run(new UpdateCurrToPendRes(req.body))
          .then((result) => {
            return res.send(result);
          })
          .catch((err) => {
            const error = new Error(err.message);
            error.status = 400;
            return next(error);
          });
        // try {
        //   const result = await Current.updateToPend(req.body);
        //   res.send(result);
        // } catch (err) {
        //   debug(err);
        //   res.status(400).json({ message: 'Failed to Move Reservation' });
        // }
      }
      if (checkIn === 'true') {
        // Update key Checked from 2 to 1
        return Conductor.run(new CheckInCurrRes(req.body, roomType))
          .then((result) => {
            return res.send(result);
          })
          .catch((err) => {
            const error = new Error(err.message);
            error.status = 400;
            return next(error);
          });
      }
      if (moveToArr === 'true') {
        return Conductor.run(new UpdateCurrToArrivals(req.body, roomType))
          .then((result) => {
            return res.send(result);
          })
          .catch((err) => {
            const error = new Error(err.message);
            error.status = 400;
            return next(error);
          });
      }
      // Regular update for the reservation
      return Conductor.run(new UpdateCurrRes(req.body))
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
     * @delete Move reservation in Current to Delete Collection
     */
    .delete(RequireBookingID, (req, res, next) => {
      const { BookingID } = req.query;

      return Conductor.run(new DeleteCurrRes(BookingID))
        .then(() => {
          return res.send('success');
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    });

  /**
   * @route Update, and delete reservations under the Delete Reservation Collection
   */
  router
    .route('/delreservations')
    /**
     * @update Update Reservations in Delete Collection Given Request Object
     */
    .put(ValidateUpdateReservation, FormatDataDate, async (req, res, next) => {
      return Conductor.run(new UpdateDelRes(req.body))
        .then(() => {
          return res.json({ message: 'Updated Successfully' });
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    })
    /**
     * @delete Pernamently Delete Reservations in Delete Collection Given BookingID
     */
    .delete(RequireBookingID, async (req, res, next) => {
      const { BookingID } = req.query;
      return Conductor.run(new DeleteDelRes(BookingID))
        .then(() => {
          return res.json({ message: 'Deleted Successfully' });
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    });

  return router;
};

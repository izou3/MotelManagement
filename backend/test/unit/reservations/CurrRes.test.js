const chai = require('chai');
const mongoose = require('mongoose');
const moment = require('moment');

const { expect } = chai;
const mongoDB = require('../../../server/lib/mongo');
const config = require('../../../server/config/index')['test'];

const ReservationSchema = require('../../../server/models/ReservationModel');
const CurrentTestModel = mongoose.model(
  'Reservation',
  ReservationSchema,
  'CurrentReservation'
);

const DeleteTestModel = mongoose.model(
  'Reservation',
  ReservationSchema,
  'DeleteReservation',
);

const PendingTestModel = mongoose.model(
  'Reservation',
  ReservationSchema,
  'PendingReservation',
);

const Pending = require('../../../server/services/reservations/PendingRes');
const Current = require('../../../server/services/reservations/CurrRes');
const Delete = require('../../../server/services/reservations/DeleteRes');

describe('CurrRes Service', function () {
  // Open and Close Mongo Connections
  before('Establish Mongo Connection', function() {
    return mongoDB.connectMongo(config.database.mongo);
  });

  after('Close Mongo Connection', function() {
    return mongoose.connection.close();
  });

  describe('Method updateNewCurrReservation', function() {
    const reservations = [
      {
        email: 'ivanz@gmail.com',
        phone: 5058934500,
        comments: '',
        YearID: 2020,
        MonthID: 1,
        BookingID: 0,
        CustomerID: 'zoui35',
        firstName: 'Ivan',
        lastName: 'Zou',
        ReservationID: 2,
        PaymentID: 1,
        RoomID: 102,
        StateID: 'MA',
        pricePaid: 67.89,
        tax: 4.56,
        checkIn: '2020-10-18',
        checkOut: '2020-10-20',
        numGuests: 2,
        Checked: 2,
      },
      {
        email: 'ivanz@gmail.com',
        phone: 5058934500,
        comments: '',
        YearID: 2020,
        MonthID: 1,
        BookingID: 1,
        CustomerID: 'zoui35',
        firstName: 'Ivan',
        lastName: 'Zou',
        ReservationID: 2,
        PaymentID: 1,
        RoomID: 102,
        StateID: 'MA',
        pricePaid: 67.89,
        tax: 4.56,
        checkIn: '2020-10-18',
        checkOut: '2020-10-20',
        numGuests: 2,
        Checked: 2,
      }
    ];

    beforeEach('Add Reservations to Current Reservation', function() {
      return CurrentTestModel.insertMany(reservations);
    });

    afterEach('Clear CurrentReservation Collection', function() {
      let promise1 = CurrentTestModel.deleteMany({}).exec();
      let promise2 = PendingTestModel.deleteMany({}).exec();
      return Promise.all([promise1, promise2]);
    });

    context('Method updateReservationByID', function() {
      it ('Update Not Checked In Guest With No Change', async function() {
        const req = { body: {} };
        req.body = reservations[0];
        return Current.updateReservationByID(0, req)
          .then((res1) => {
            return Current.getCurrReservationByID(0)
              .then((res2) => {
                // Ignore These fields due to Mongoose Date Object Frustration
                delete res2.checkIn;
                delete res2.checkOut;
                delete res2.created_date;
                expect(res1).to.include(res2);
              });
            // reservations[0].checkIn = new Date(Date.UTC(2020, 9, 18, 0, 0, 0)).toUTCString();
            // reservations[0].checkOut = new Date(Date.UTC(2020, 9, 20, 0, 0, 0)).toUTCString();
          });
      });

      it ('Update Not Checked In Guest With Change', function() {
        reservations[0].firstName = 'James';
        reservations[0].email = 'izou3@gatech.edu';
        const req = { body: {} };
        req.body = reservations[0];
        return Current.updateReservationByID(0, req)
        .then((res1) => {
          return Current.getCurrReservationByID(0)
            .then((res2) => {
              delete res2.checkIn;
              delete res2.checkOut;
              delete res2.created_date;
              expect(res1).to.include(res2);
            });
        });
      });

      it ('Update Not Checked In Guest with Not Enough Fields', function() {
        const req = { body: {} };
        req.body = reservations[1];
        return Current.updateReservationByID(1, { ...req, pricePaid: undefined, RoomID: undefined })
          .catch((err) => {
            expect(err).to.be.an('error');
          });
      });

      // TODO: implent testing for Checked-In Guests

    });

    context('Method updateToPend()', function() {
      it ('Move Reservation From Current to Pending', async function() {
        await Current.updateToPend(reservations[0]);

        Current.getCurrReservationByID(0)
          .then((res) => expect(res).to.be.null);

        return Pending.getReservationByID(0)
          .then((res) => expect(res.BookingID).to.equal(0));
      });

      it ('Move Non-existent Reservation from Current to Pending', async function() {
        try {
          await Current.updateToPend({ ...reservations[0], BookingID: 3 });
        } catch (err) {
          expect(err.message).to.equal('Reservation Does Not Exist');
        }

        Current.getCurrReservationByID(0)
        .then((res) => expect(res.BookingID).to.equal(0));

        return Pending.getReservationByID(0)
          .then((res) => expect(res).to.be.null);
      });
    });
  });

  describe('Method deleteReservationByID()', function() {

    beforeEach(function () {
      const reservations = [
        {
          email: 'ivanz@gamil.com',
          phone: 5058934500,
          comments: '',
          YearID: 2020,
          MonthID: 1,
          BookingID: 0,
          CustomerID: 'zoui35',
          firstName: 'Ivan',
          lastName: 'Zou',
          ReservationID: 2,
          PaymentID: 1,
          RoomID: 102,
          StateID: 'MA',
          pricePaid: 67.89,
          tax: 4.56,
          checkIn: '2020-10-18T23:59:59.000+00:00',
          checkOut: '2020-10-20',
          numGuests: 2,
          Checked: 0,
        }
      ];
      return CurrentTestModel.insertMany(reservations);
    });

    afterEach(function() {
      let promise1 = DeleteTestModel.deleteMany({}).exec();
      let promise2 = CurrentTestModel.deleteMany({}).exec();
      return Promise.all([promise1, promise2]);
    });

    it('Reservation Moved to Delete Collection Success', async function() {
      await Current.deleteReservationByID(0);

      Delete.getReservationByID(0)
        .then((res) => expect(res.BookingID).to.equal(0));

      return Current.getCurrReservationByID(0)
      .then((res) => {
        expect(res).to.be.null;
      });
    });

    it('Delete a Non-existant ID', async function() {
      Current.deleteReservationByID(2323)
        .catch((err) => expect(err.message).to.equal('Reservation Does Not Exist'));

      Current.getCurrReservation()
      .then((res) => {
        expect(res).to.be.an('array');
        expect(res[0].BookingID).to.equal(0);
      });

      return Delete.getAllDeleteReservation()
        .then((res) => {
          expect(res).to.be.an('array');
          expect(res.length).to.equal(0);
        });
    });

    it('Delete Undefined ID', async function() {
      Current.deleteReservationByID(null)
        .catch((err) => expect(err).to.be.an('error'));

      Current.getCurrReservation()
      .then((res) => {
        expect(res).to.be.an('array');
        expect(res[0].BookingID).to.equal(0);
      });

      return Delete.getAllDeleteReservation()
        .then((res) => {
          expect(res).to.be.an('array');
          expect(res.length).to.equal(0);
        });
    });

    it('Delete Non-Numeric ID', async function() {
      Current.deleteReservationByID('hello')
        .catch((err) => expect(err.message).to.equal('Cast to number failed for value \"hello\" at path \"BookingID\" for model \"Reservation\"'));

      Current.getCurrReservation()
        .then((res) => {
          expect(res).to.be.an('array');
          expect(res[0].BookingID).to.equal(0);
        });

      return Delete.getAllDeleteReservation()
        .then((res) => {
          expect(res).to.be.an('array');
          expect(res.length).to.equal(0);
        });
    });
  });
});


const chai = require('chai');
const mongoose = require('mongoose');

const { expect } = chai;
const mongoDB = require('../../../server/lib/mongo');
const config = require('../../../server/config/index')['test'];

const ReservationSchema = require('../../../server/models/ReservationModel');
const PendTestModel = mongoose.model(
  'Reservation',
  ReservationSchema,
  'PendingReservation'
);

const CurrentTestModel = mongoose.model(
  'Reservation',
  ReservationSchema,
  'CurrentReservation',
);

const DeleteTestModel = mongoose.model(
  'Reservation',
  ReservationSchema,
  'DeleteReservation',
);

const Pending = require('../../../server/services/reservations/PendingRes');
const Current = require('../../../server/services/reservations/CurrRes');
const Delete = require('../../../server/services/reservations/DeleteRes');

describe('PendingRes Service', function () {

  // Open and Close Mongo Connections
  before('Establish Mongo Connection', function() {
    return mongoDB.connectMongo(config.database.mongo);
  });

  after('Close Mongo Connection', function() {
    return mongoose.connection.close();
  });

  describe ('Method Methods', function() {
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
        checkIn: '2020-10-18',
        checkOut: '2020-10-20',
        numGuests: 2,
        Checked: 2,
      }
    ];

    beforeEach('Add Reservation into Pending', function() {
      return PendTestModel.insertMany(reservations);
    });

    afterEach('Delete Reservations from Collections', function() {
      let promise1 = PendTestModel.deleteMany({}).exec();
      let promise2 = DeleteTestModel.deleteMany({}).exec();
      let promise3 = CurrentTestModel.deleteMany({}).exec();
      return Promise.all([promise1, promise2, promise3]);
    });

    context('Method deleteReservationByID', function() {
      it('Moves Reservations from Pending into Delete', async function() {
        await Pending.deleteReservationByID(0);

        Pending.getReservationByID(0)
          .then((res) => {
            expect(res).to.be.null;
          });

        return Delete.getReservationByID(0)
          .then((res) => {
            expect(res.BookingID).to.equal(0);
          });
      });

      it('Nonexistent BookingID', async function() {
        Pending.deleteReservationByID(23)
          .catch((err) => expect(err.message).to.equal('Reservation is Not Defined'));

        return Delete.getReservationByID(0)
          .then(res => expect(res).to.be.null);
      });
    });

    context('Method updateToCurr()', function() {
      it('Moves Reservation from Pending to Current', async function() {
        await Pending.updateToCurr(reservations[0]);

        Pending.getReservationByID(0)
          .then((res) => {
            expect(res).to.be.null;
          });

        return Current.getCurrReservationByID(0)
          .then((res) => {
            expect(res.BookingID).to.equal(0);
            expect(res.Checked).to.equal(2);
          });
      });

      it('Move Undefined BookingID to Current', async function() {
        Pending.updateToCurr({ ...reservations[0], BookingID: 89})
          .catch((err) => expect(err.message).to.equal('Reservation Does Not Exist'));

        return Current.getCurrReservation()
          .then((res) => {
            expect(res).to.be.an('array');
            expect(res.length).to.equal(0);
          });
      });
    });
  });

  describe('Method moveToCurrRes()', function() {

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
          Checked: 2,
        },
        {
          email: 'ivanz@gamil.com',
          phone: 5058934500,
          comments: '',
          YearID: 2020,
          MonthID: 1,
          BookingID: 1,
          CustomerID: 'zoui35',
          firstName: 'Ivan',
          lastName: 'White',
          ReservationID: 2,
          PaymentID: 1,
          RoomID: 102,
          StateID: 'MA',
          pricePaid: 67.89,
          tax: 4.56,
          checkIn: '2020-10-19T00:00:00.000+00:00',
          checkOut: '2020-10-20',
          numGuests: 2,
          Checked: 2,
        },
        {
          email: 'ivanz@gamil.com',
          phone: 5058934500,
          comments: '',
          YearID: 2020,
          MonthID: 1,
          BookingID: 2,
          CustomerID: 'zoui35',
          firstName: 'Ivan',
          lastName: 'Zou',
          ReservationID: 2,
          PaymentID: 1,
          RoomID: 102,
          StateID: 'MA',
          pricePaid: 67.89,
          tax: 4.56,
          checkIn: '2020-10-17T00:00:00.000+00:00',
          checkOut: '2020-10-20',
          numGuests: 2,
          Checked: 2,
        },
        {
          email: 'ivanz@gamil.com',
          phone: 5058934500,
          comments: '',
          YearID: 2020,
          MonthID: 1,
          BookingID: 3,
          CustomerID: 'zoui35',
          firstName: 'Ivan',
          lastName: 'Zou',
          ReservationID: 2,
          PaymentID: 1,
          RoomID: 102,
          StateID: 'MA',
          pricePaid: 67.89,
          tax: 4.56,
          checkIn: '2020-10-20T23:59:59.000+00:00',
          checkOut: '2020-10-21',
          numGuests: 2,
          Checked: 2,
        }
      ];
      return PendTestModel.insertMany(reservations);
    });

    afterEach(function() {
      let promise1 = PendTestModel.deleteMany({}).exec();
      let promise2 = CurrentTestModel.deleteMany({}).exec();
      return Promise.all([promise1, promise2]);
    });

    it('Half of the Reservations Should be Moved to Current', async function() {
      await Pending.moveToCurrRes('2020-10-17', '2020-10-19');

      return Pending.getReservationByName('Ivan')
      .then((res) => {
        res.sort((a, b) => (a.BookingID > b.BookingID) ? 1 : -1);
        expect(res).to.be.an('array');
        expect(res.length).to.equal(2);
        expect(res[0].BookingID).to.equal(1);
        expect(res[1].BookingID).to.equal(3);
      });
    });

    it('No Reservations Should be moved to Current (1)', async function() {
      try {
        await Pending.moveToCurrRes('2020-10-15', '2020-10-17');
      } catch(err) {
        expect(err).to.be.an('error');
        expect(err.message).to.equal('No Documents');
      }
    });

    it('All Reservations Should be moved to Current', async function() {
      await Pending.moveToCurrRes('2020-10-17', '2020-10-21');
      return Current.getCurrReservationByName('Ivan')
        .then((res) => {
          res.sort((a, b) => (a.BookingID > b.BookingID) ? 1 : -1);
          expect(res.length).to.equal(4);
          for(let i = 0; i < res.length; i++) {
            expect(res[i].BookingID).to.equal(i);
          }
        });
    });

    it('No Reservations Should Be Moved to Current (2)', async function() {
      try {
        await Pending.moveToCurrRes('2020-10-21', '2020-10-25');
      } catch(err) {
        expect(err).to.be.an('error');
        expect(err.message).to.equal('No Documents');
      }
    });

  });
});


const chai = require('chai');
const mongoose = require('mongoose');

const { expect } = chai;

const mongoDB = require('../../../server/lib/mongo');
const config = require('../../../server/config/index')['test'];
const ReservationSchema = require('../../../server/models/ReservationModel.js');

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

const { UpdateToCurrentReservationsCommand } = require('../../../server/services/JobCommands/index');

describe('Test UpdateCurrent Job', function() {
  // Open and Close Mongo Connections
  before('Establish Mongo Connection', function() {
    return mongoDB.connectMongo(config.database.mongo);
  });

  after('Close Mongo Connection', function() {
    return mongoose.connection.close();
  });

  describe('Method moveToCurrRes() from Pending Service', function() {

    beforeEach(function () {
      const reservations = [
        {
          email: 'ivanz@gamil.com',
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
          checkIn: '2020-10-18T12:00:00.000+00:00',
          checkOut: '2020-10-20T12:00:00.000+00:00',
          numGuests: 2,
          Checked: 2,
          HotelID: 58566,
          StyleID: 0
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
          lastName: 'White',
          ReservationID: 2,
          PaymentID: 1,
          RoomID: 102,
          StateID: 'MA',
          pricePaid: 67.89,
          tax: 4.56,
          checkIn: '2020-10-19T12:00:00.000+00:00',
          checkOut: '2020-10-20T12:00:00.000+00:00',
          numGuests: 2,
          Checked: 2,
          HotelID: 58566,
          StyleID: 0
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
          checkIn: '2020-10-17T12:00:00.000+00:00',
          checkOut: '2020-10-20T12:00:00.000+00:00',
          numGuests: 2,
          Checked: 2,
          HotelID: 58566,
          StyleID: 0
        },
        {
          email: 'ivanz@gamil.com',
          phone: 5058934500,
          comments: '',
          YearID: 2020,
          MonthID: 1,
          BookingID: 4,
          CustomerID: 'zoui35',
          firstName: 'Ivan',
          lastName: 'Zou',
          ReservationID: 2,
          PaymentID: 1,
          RoomID: 102,
          StateID: 'MA',
          pricePaid: 67.89,
          tax: 4.56,
          checkIn: '2020-10-20T12:00:00.000+00:00',
          checkOut: '2020-10-21T12:00:00.000+00:00',
          numGuests: 2,
          Checked: 2,
          HotelID: 58566,
          StyleID: 0
        }
      ];
      return PendTestModel.insertMany(reservations);
    });

    afterEach(function() {
      let promise1 = PendTestModel.deleteMany({}).exec();
      let promise2 = CurrentTestModel.deleteMany({}).exec();
      return Promise.all([promise1, promise2]);
    });

    it('2 Reservations Should be Moved to Current', function(done) {
      const UpdateCurrent = new UpdateToCurrentReservationsCommand(
        '58566',
        '2020-10-17T00:00:00.000+00:00',
        '2020-10-19T00:00:00.000+00:00'
      );
      UpdateCurrent.execute()
        .then((res) => {
          expect(res.length).to.equal(2);
          res.sort((a, b) => (a.BookingID > b.BookingID) ? 1 : -1);
          expect(res[0].BookingID).to.equal(1);
          expect(res[1].BookingID).to.equal(3);

          return CurrentTestModel.find({})
            .then((res) => {
              expect(res.length).to.equal(2);
              done();
            });
        })
        .catch(err => done(err));
    });

    it('No Reservations Should be moved to Current (1)', function(done) {
      const UpdateCurrent = new UpdateToCurrentReservationsCommand(
        '58566',
        '2020-10-15T00:00:00.000+00:00',
        '2020-10-17T00:00:00.000+00:00'
      );
      UpdateCurrent.execute()
        .then((res) => {
          expect(res).to.be.an('array').that.is.empty;

          return PendTestModel.find({})
            .then((res) => {
              expect(res.length).to.equal(4);
              done();
            });
        })
        .catch(err => done(err));
    });

    it('All Reservations Should be moved to Current', function(done) {
      const UpdateCurrent = new UpdateToCurrentReservationsCommand(
        '58566',
        '2020-10-17T00:00:00.000+00:00',
        '2020-10-21T00:00:00.000+00:00'
      );
      UpdateCurrent.execute()
        .then((res) => {
          expect(res.length).to.equal(4);

          return CurrentTestModel.find({})
            .then((res) => {
              expect(res.length).to.equal(4);

              return PendTestModel.find({})
                .then((res) => {
                  expect(res.length).to.equal(0);
                  done();
                });
            });
        })
        .catch(err => done(err));
    });

    it('No Reservations Should Be Moved to Current (2)', function(done) {
      const UpdateCurrent = new UpdateToCurrentReservationsCommand(
        '58566',
        '2020-10-21T00:00:00.000+00:00',
        '2020-10-25T00:00:00.000+00:00'
      );
      UpdateCurrent.execute()
        .then((res) => {
          expect(res).to.be.an('array').that.is.empty;

          return PendTestModel.find({})
            .then((res) => {
              expect(res.length).to.equal(4);
              done();
            });
        });
    });

    // To test this as a transaction throw an error in moveToCurr Method
    // it.only('All Reservations Should Be Moved to Current (test)', function(done) {
    //   const UpdateCurrent = new UpdateToCurrentReservationsCommand(
    //     '58566',
    //     '2020-10-17T00:00:00.000+00:00',
    //     '2020-10-21T00:00:00.000+00:00'
    //   );
    //   UpdateCurrent.execute()
    //     .then((res) => {
    //       done(new Error('failed'));
    //     })
    //     .catch((err) => {
    //       expect(err.message).to.equal('test');

    //       return PendTestModel.find({})
    //         .then((res) => {
    //           expect(res.length).to.equal(4);

    //           return CurrentTestModel.find({})
    //             .then((res) => {
    //               expect(res).to.be.an('array').that.is.empty;
    //               done();
    //             });
    //         });
    //     });
    // });
  });
});

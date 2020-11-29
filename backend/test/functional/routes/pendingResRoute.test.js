const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mongoose = require('mongoose');

chai.use(chaiHttp);
const { expect } = chai;

const mongoDB = require('../../../server/lib/mongo');
const config = require('../../../server/config/index')['test'];

const TestReservationSchema = require('../../../server/models/ReservationModel');

const PendingTestModel = mongoose.model(
  'Reservation',
  TestReservationSchema,
  'PendingReservation',
);

const CurrentTestModel = mongoose.model(
  'Reservation',
  TestReservationSchema,
  'CurrentReservation'
);

const DeleteTestModel = mongoose.model(
  'Reservation',
  TestReservationSchema,
  'DeleteReservation',
);

describe('Pending Reservation Routes', function() {
  let auth;
  let app;
  let mongoStub;
  let sqlStub;
  let agendaStub;
  const ReservationObj = {
    email: 'ivanz@gamil.com',
    phone: 5058934500,
    comments: '',
    YearID: 2020,
    MonthID: 1,
    BookingID: 2020,
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
  };

  before('Establish Mongo Connection', function() {
    auth = require('../../../server/services/Staff');
    sinon.stub(auth, 'loginRequired').callsFake(function(req, res, next) {
      return next();
    });

    agendaStub = {
      now: sinon.stub(),
    };

    mongoStub = function() {
      return sinon.stub();
    };

    sqlStub = function() {
      return sinon.stub();
    };

    app = require('../../../server/index')({ values: [mongoStub, sqlStub], agenda: agendaStub });

    return mongoDB.connectMongo(config.database.mongo);
  });

  after('Close Mongo Connection', function() {
    sinon.restore();
    return mongoose.connection.close();
  });

  context('POST: /api/reservation/PendingReservation', function() {
    it('Successfully Add New Reservation to Pending Collection', function(done) {
      chai.request(app)
        .post('/api/reservation/PendingReservation')
        .type('application/json')
        .send(ReservationObj)
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal('Successfully Added New Reservation!');

          return PendingTestModel
            .find({})
            .then((res) => {
              expect(res[0].BookingID).to.equal(2020);
              done();
            });
        })
        .catch(err => done(err));
    });

    it('Fail to Add New Reservation with Missing Fields', function(done) {
      chai.request(app)
        .post('/api/reservation/PendingReservation')
        .type('form')
        .send({ exists: true })
        .end(function(err, res) {
          expect(res).to.have.status(400);

          return PendingTestModel
            .find({})
            .then((res) => {
              expect(res[0].BookingID).to.equal(2020);
              done();
            })
            .catch(err=> done(err));
        });
    });

    it('Fail to Add New Reservation with Invalid Fields', function(done) {
      chai.request(app)
        .post('/api/reservation/PendingReservation')
        .type('form')
        .send({
          ...ReservationObj,
          checkIn: 40,
          checkOut: Math.random(),
          numGuests: 'string',
          Checked: new Date(),
        })
        .end(function(err, res) {
          expect(res).to.have.status(400);

          return PendingTestModel
            .find({})
            .then((res) => {
              expect(res[0].BookingID).to.equal(2020);
              done();
            })
            .catch(err=> done(err));
        });
    });
  });

  context('PUT: /api/reservation/PendingReservation', function() {
    describe('PUT: /api/reservation/PendingReservation', function() {
      it('Fail Request with Undefined BookingID', function(done) {
        chai.request(app)
          .put('/api/reservation/PendingReservation')
          .type('form')
          .send({ exists: true })
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Undefined BookingID');
            done();
          });
      });
    });

    describe('PUT: /api/reservation/PendingReservation?BookingID=2020&dateChange=false', function() {
      it('Update Reservation Successfully', function(done) {
        chai.request(app)
          .put('/api/reservation/PendingReservation?BookingID=2020&dateChange=false')
          .type('form')
          .send({
            ...ReservationObj,
            numGuests: 3,
            firstName: 'James',
          })
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body.message).to.equal('Succesfully Updated Reservation');

            return PendingTestModel
              .find({})
              .then((res) => {
                expect(res[0].BookingID).to.equal(2020);
                expect(res[0].numGuests).to.equal(3);
                expect(res[0].firstName).to.equal('James');
                done();
              })
              .catch(err=> done(err));
          });
      });

      it('Fail to Update with Nonexistent BookingID', function(done) {
        chai.request(app)
          .put('/api/reservation/PendingReservation?BookingID=200&dateChange=false')
          .type('form')
          .send({
            ...ReservationObj,
            BookingID: 200,
          })
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Reservation is Not Defined');

            return PendingTestModel
              .find({})
              .then((res) => {
                expect(res[0].BookingID).to.equal(2020);
                done();
              })
              .catch(err=> done(err));
          });
      });

      it('Fail to Update with Missing Fields', function(done) {
        chai.request(app)
        .put('/api/reservation/PendingReservation?BookingID=2020&dateChange=false')
        .type('form')
        .send({
          exists: true
        })
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
      });

      it('Fail to Update with Invalid Fields', function(done) {
        chai.request(app)
          .put('/api/reservation/PendingReservation?BookingID=2020&dateChange=false')
          .type('form')
          .send({
            ...ReservationObj,
            checkIn: 40,
            checkOut: Math.random(),
            numGuests: 'string',
            Checked: new Date(),
          })
          .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
          });
      });
    });

    describe('PUT: /api/reservation/PendingReservation?BookingID=2020&dateChange=true', function() {
      it('Fail to Update with Nonexistent BookingID', function(done) {
        chai.request(app)
          .put('/api/reservation/PendingReservation?BookingID=200&dateChange=true')
          .type('form')
          .send({
            ...ReservationObj,
            BookingID: 200,
          })
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Reservation is Not Defined');
            return CurrentTestModel.find({})
              .then((res) => {
                expect(res.length).to.equal(0);
                done();
              });
          });
      });

      it('Fail to Update with Missing Fields', function(done) {
        chai.request(app)
          .put('/api/reservation/PendingReservation?BookingID=2020&dateChange=true')
          .type('form')
          .send({
            exists: true
          })
          .end(function(err, res) {
            expect(res).to.have.status(400);
            return CurrentTestModel.find({})
              .then((res) => {
                expect(res.length).to.equal(0);
                done();
              });
          });
      });

      it('Fail to Update with Invalid Fields', function(done) {
        chai.request(app)
          .put('/api/reservation/PendingReservation?BookingID=2020&dateChange=true')
          .type('form')
          .send({
            ...ReservationObj,
            checkIn: 40,
            checkOut: Math.random(),
            numGuests: 'string',
            Checked: new Date(),
          })
          .end(function(err, res) {
            expect(res).to.have.status(400);

            return CurrentTestModel.find({})
              .then((res) => {
                expect(res.length).to.equal(0);
                done();
              });
          });
      });

      it('Update Reservation Successfully into Current', function(done) {
        chai.request(app)
          .put('/api/reservation/PendingReservation?BookingID=2020&dateChange=true')
          .type('form')
          .send({
            ...ReservationObj,
            numGuests: 3,
            firstName: 'James',
          })
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body.message).to.equal('Succesfully Updated Reservation');

            return CurrentTestModel
              .find({})
              .then((res) => {
                expect(res[0].BookingID).to.equal(2020);
                expect(res[0].numGuests).to.equal(3);
                expect(res[0].firstName).to.equal('James');
                expect(res[0].Checked).to.equal(2);
                done();
              })
              .catch(err=> done(err));
          });
      });
    });
  });

  context('DELETE: /api/reservation/PendingReservation', function() {
    before('Add Reservation to Pending to Delete', function() {
      return PendingTestModel.insertMany([ReservationObj]);
    });

    after('Delete All Records from Collections', function() {
      let promise1 = PendingTestModel.deleteMany({}).exec();
      let promise2 = DeleteTestModel.deleteMany({}).exec();
      let promise3 = CurrentTestModel.deleteMany({}).exec();
      return Promise.all([promise1, promise2, promise3]);
    });

    it('Fail to Delete with Undefined BookingID', function(done) {
      chai.request(app)
        .delete('/api/reservation/PendingReservation')
        .then(function(res) {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Undefined BookingID');
          done();
        })
        .catch(err => done(err));
    });

    it('Fail to Delete with Non-existent BookingID', function(done) {
      chai.request(app)
        .delete('/api/reservation/PendingReservation?BookingID=200')
        .end(function(err, res) {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Failed to Remove Reservation');

          return PendingTestModel.find({})
          .then((res) => {
            expect(res[0].BookingID).to.equal(2020);
            done();
          });
        });
    });

    it('Fail to Delete with Invalid BookingID', function(done) {
      chai.request(app)
        .delete('/api/reservation/PendingReservation?BookingID=string')
        .end(function(err, res) {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Undefined BookingID');

          return PendingTestModel.find({})
          .then((res) => {
            expect(res[0].BookingID).to.equal(2020);
            done();
          });
        });
    });

    it('Successfully Delete Reservation from Pending', function(done) {
      chai.request(app)
        .delete('/api/reservation/PendingReservation?BookingID=2020')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal('Successfully Removed Reservation');

          return DeleteTestModel.find({})
          .then((res) => {
            expect(res[0].BookingID).to.equal(2020);
            done();
          });
        });
    });
  });
});

const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mongoose = require('mongoose');

chai.use(chaiHttp);
const { expect } = chai;

const mongoDB = require('../../../server/lib/mongo');
const config = require('../../../server/config/index')['test'];

const TestReservationSchema = require('../../../server/models/ReservationModel');

const DeleteTestModel = mongoose.model(
  'Reservation',
  TestReservationSchema,
  'DeleteReservation',
);

describe('Delete Reservation Routes', function() {
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
    HotelID: 58566,
    StyleID: 0,
  };

  before('Establish Mongo Connection', function() {
    return mongoDB.connectMongo(config.database.mongo);
  });

  after('Close Mongo Connection', function() {
    return mongoose.connection.close();
  });

  describe('PUT and Delete for DeleteReservation Collection', function() {
    before('Establish Dependencies', function() {
      auth = require('../../../server/middlewares/AuthMiddlewares');
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
      const promise1 = DeleteTestModel.insertMany([ReservationObj]);
      return Promise.all([promise1]);
    });

    after('Close Mongo Connection', function() {
      sinon.restore();
      const promise1 = DeleteTestModel.deleteMany({}).exec();
      return Promise.all([promise1]);
    });

    context('PUT: /api/reservation/delreservations', function() {
      it('Successfully Update Reservation', function(done) {
        chai.request(app)
          .put('/api/reservation/delreservations?HotelID=58566')
          .type('form')
          .send({
            ...ReservationObj,
            numGuests: 3,
            firstName: 'James',
          })
          .then(function(res) {
            expect(res).to.have.status(200);
            expect(res.body.message).to.equal('Updated Successfully');

            return DeleteTestModel
              .find({})
              .then((res) => {
                expect(res[0].BookingID).to.equal(2020);
                expect(res[0].numGuests).to.equal(3);
                expect(res[0].firstName).to.equal('James');
                done();
              });
          })
          .catch(err => done(err));
      });

      it('Fail to Update with Nonexistent BookingID', function(done) {
        chai.request(app)
          .put('/api/reservation/delreservations?HotelID=58566')
          .type('application/json')
          .send({
            ...ReservationObj,
            numGuests: 3,
            BookingID: 20,
          })
          .then(function(res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Reservation Does Not Exist');

            return DeleteTestModel
              .find({})
              .then((res) => {
                expect(res[0].BookingID).to.equal(2020);
                expect(res[0].numGuests).to.equal(3);
                expect(res[0].firstName).to.equal('James');
                done();
              });
          })
          .catch(err => done(err));
      });

      it('Fail to Update with Missing Fields', function(done) {
        chai.request(app)
          .put('/api/reservation/delreservations?HotelID=58566')
          .type('form')
          .send({
            exists: true
          })
          .then(function(res) {
            expect(res).to.have.status(400);

            return DeleteTestModel
              .find({})
              .then((res) => {
                expect(res[0].BookingID).to.equal(2020);
                expect(res[0].numGuests).to.equal(3);
                expect(res[0].firstName).to.equal('James');
                done();
              });
          })
          .catch(err => done(err));
      });

      it('Fail to Update with Invalid Fields', function(done) {
        chai.request(app)
          .put('/api/reservation/delreservations?HotelID=58566')
          .type('form')
          .send({
            ...ReservationObj,
            checkIn: 40,
            checkOut: Math.random(),
            numGuests: 'string',
            Checked: new Date(),
          })
          .then(function(res) {
            expect(res).to.have.status(400);

            return DeleteTestModel
              .find({})
              .then((res) => {
                expect(res[0].BookingID).to.equal(2020);
                expect(res[0].numGuests).to.equal(3);
                expect(res[0].firstName).to.equal('James');
                done();
              });
          })
          .catch(err => done(err));
      });
    });

    context('DELETE: /api/reservation/delreservations?BookingID=', function() {
      it('Fail to Delete with Nonexistent BookingID', function(done) {
        chai.request(app)
          .delete('/api/reservation/delreservations?HotelID=58566&BookingID=20')
          .then(function(res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Reservation Does Not Exist');

            return DeleteTestModel
              .find({})
              .then((res) => {
                expect(res[0].BookingID).to.equal(2020);
                expect(res[0].numGuests).to.equal(3);
                expect(res[0].firstName).to.equal('James');
                done();
              });
          })
          .catch(err => done(err));
      });

      it('Fail to Delete with Invalid BookingID', function(done) {
        chai.request(app)
          .delete('/api/reservation/delreservations?HotelID=58566&BookingID=string')
          .then(function(res) {
            expect(res).to.have.status(400);

            return DeleteTestModel
              .find({})
              .then((res) => {
                expect(res[0].BookingID).to.equal(2020);
                expect(res[0].numGuests).to.equal(3);
                expect(res[0].firstName).to.equal('James');
                done();
              });
          })
          .catch(err => done(err));
      });

      it('Successfully Delete Reservation', function(done) {
        chai.request(app)
          .delete('/api/reservation/delreservations?HotelID=58566&BookingID=2020')
          .then(function(res) {
            expect(res).to.have.status(200);
            expect(res.body.message).to.equal('Deleted Successfully');

            return DeleteTestModel
              .find({})
              .then((res) => {
                expect(res.length).to.equal(0);
                done();
              });
          })
          .catch(err => done(err));
      });
    });
  });
});

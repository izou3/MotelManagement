const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mongoose = require('mongoose');
const moment = require('moment');

chai.use(chaiHttp);
const { expect } = chai;

const mongoDB = require('../../../server/lib/mongo');
const SQLPool = require('../../../server/lib/sql');
const config = require('../../../server/config/index')['test'];

const TestReservationSchema = require('../../../server/models/ReservationModel');
const TestReportSchmema = require('../../../server/models/DailyReport.js');

const CurrentTestModel = mongoose.model(
  'Reservation',
  TestReservationSchema,
  'CurrentReservation'
);

const ReportTest = mongoose.model('DailyReport', TestReportSchmema, 'DailyReport');

describe('Customer Routes', function() {
  let auth;
  let app;
  let mongoStub;
  let agendaStub;

  const ReservationObjs = [
    {
      email: 'ivanz@gamil.com',
      phone: 5058934500,
      comments: '',
      YearID: 2020,
      MonthID: 10,
      BookingID: 2020112390,
      CustomerID: 'zoui35',
      firstName: 'Tyler',
      lastName: 'Tran',
      ReservationID: 2,
      PaymentID: 1,
      RoomID: 101,
      StateID: 'MA',
      pricePaid: 95.67,
      tax: 4.00,
      checkIn: '2020-09-18T12:00:00.000Z',
      checkOut: '2020-09-19T12:00:00.000Z',
      numGuests: 2,
      Checked: 1,
      HotelID: 58566,
      StyleID: 0,
    }, {
      email: 'ivanz@gamil.com',
      phone: 5058934500,
      comments: '',
      YearID: 2020,
      MonthID: 10,
      BookingID: 2020112367,
      CustomerID: 'zoui35',
      firstName: 'Tyler',
      lastName: 'Tran',
      ReservationID: 2,
      PaymentID: 1,
      RoomID: 102,
      StateID: 'MA',
      pricePaid: 100,
      tax: 50,
      checkIn: '2020-09-10T12:00:00.000Z',
      checkOut: '2020-09-25T12:00:00.000Z',
      numGuests: 2,
      Checked: 1,
      HotelID: 58566,
      StyleID: 0,
    }
  ];

  const reportObj = [
    {
      YearID: 2020,
      MonthID: 10,
      Date: moment().format('YYYY-MM-DD'),
      Refund: {
        Amount: 0,
        Notes: ""
      },
      Stays:{
        "101":{
          "Room": {
            BookingID: 2020112390,
            type: "WK1",
            payment: "",
            startDate: '2020-09-18T12:00:00.000Z',
            endDate: '',
            paid: true,
            rate: 0,
            tax: 0,
            initial: "",
          },
          "HouseKeeping": {
            status: "O",
            type: "W",
            houseKeeper: "",
            notes: ""
          }
        },
        "102":{
          "Room": {
            BookingID: 2020112367,
            type: "WK1",
            payment: "",
            startDate: '2020-09-10T12:00:00.000Z',
            endDate: '2020-09-24T12:00:00.000Z',
            paid: true,
            rate: 0,
            tax: 0,
            initial: "",
          },
          "HouseKeeping": {
            "status":"O",
            "type":"W",
            "houseKeeper":"",
            "notes":""
          }
        },
      }
    }
  ];

  before('Establish Mongo Connection', function() {
    return mongoDB.connectMongo(config.database.mongo);
  });

  after('Close Mongo Connection', function() {
    return mongoose.connection.close();
  });

  /**
   * WHEN TEST FINISHED MAKE SURE TO EXECUTE THE FOLLOWING QUERIES IN MYSQL
   * UNDER TABLE LAZYUMOTELTEST TO RESET THE TESTS
   *
   * DELETE FROM IndCustomer WHERE CustomerID = 'zoui35';
   * DELETE FROM Customer WHERE ID = 'zoui35';
   */
  describe('Checked Out and Update Customers', function() {
    before('Require Dependencies', function() {
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

      return Promise.resolve(SQLPool.connectSQL(config.database.sql))
        .then((pool) => {
          app = require('../../../server/index')({ values: [mongoStub, pool], agenda: agendaStub });
        });
    });

    after('Restore Auth Stub', function() {
      sinon.restore();
    });

    context('POST: /api/customer?HotelID=58566', function() {
      before('Insert Reservations', function(){
        const promise1 = CurrentTestModel.insertMany(ReservationObjs);
        const promise2 = ReportTest.insertMany(reportObj);
        return Promise.all([promise1, promise2]);
      });

      after('Delete Reservations', function() {
        const promise1 = CurrentTestModel.deleteMany({}).exec();
        const promise2 = ReportTest.deleteMany({}).exec();
        return Promise.all([promise2]);
      });

      it('Fail to CheckOut with Undefined BookingID', function(done) {
        chai.request(app)
          .post('/api/customer?HotelID=58566&roomType=S')
          .type('application/json')
          .send({
            ...ReservationObjs[0],
            BookingID: undefined
          })
          .then((res) => {

            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Undefined BookingID');
            done();
          })
          .catch(err => done(err));
      });

      it('Fail to CheckOut with NaN BookingID', function(done) {
        chai.request(app)
          .post('/api/customer?HotelID=58566&roomType=S')
          .type('application/json')
          .send({
            ...ReservationObjs[0],
            BookingID: 'string'
          })
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Undefined BookingID');
            done();
          })
          .catch(err => done(err));
      });

      it('Fail to CheckOut with Nonexistent BookingID', function(done) {
        chai.request(app)
          .post('/api/customer?HotelID=58566&roomType=S')
          .type('application/json')
          .send({
            ...ReservationObjs[0],
            BookingID: 2020,
          })
          .then((res) => {
            expect(res).to.have.status(400);
            done();
          })
          .catch(err => done(err));
      });

      it('Fail to CheckOut with Missing Fields', function(done) {
        chai.request(app)
          .post('/api/customer?HotelID=58566&roomType=S')
          .type('application/json')
          .send({
            exists: true,
            BookingID: 200,
          })
          .then((res) => {
            expect(res).to.have.status(400);
            done();
          })
          .catch(err => done(err));
      });

      // Strict Mode in MySQl Not Enabled so won't check for insert with invalid fields
      // Frontend will handle form validation

      it('Successfully CheckOut with No Previous Records', function(done) {
        chai.request(app)
          .post('/api/customer?HotelID=58566&roomType=S')
          .type('application/json')
          .send(ReservationObjs[0])
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('Object');
            expect(res.body.UpdatedReport.Stays['101'].Room.BookingID).to.be.undefined;
            expect(res.body.UpdatedReport.Stays['101'].Room.startDate).to.be.undefined;
            expect(res.body.UpdatedReport.Stays['101'].HouseKeeping).to.include({
              status: "C",
              type: "S",
              houseKeeper: "",
              notes: ""
            });

            return CurrentTestModel.find({})
              .then((res) => {
                expect(res.length).to.equal(1);
                done();
              });
          })
          .catch(err => done(err));
      });

      it('Successfully CheckOut with Previous Records', function(done) {
        chai.request(app)
          .post('/api/customer?HotelID=58566')
          .type('application/json')
          .send({
            ...ReservationObjs[1],
            RoomID: 120
          })
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('Object');
            expect(res.body.UpdatedReport.Stays['102'].Room.BookingID).to.be.undefined;
            expect(res.body.UpdatedReport.Stays['102'].Room.startDate).to.be.undefined;
            expect(res.body.UpdatedReport.Stays['102'].HouseKeeping).to.include({
              status: "C",
              type: "W",
              houseKeeper: "",
              notes: ""
            });

            return CurrentTestModel.find({})
              .then((res) => {
                expect(res.length).to.equal(0);
                done();
              });
          })
          .catch(err => done(err));
      });
    });

    context('PUT: /api/customer/', function() {
      // ReservationObjs[0,1] are both in SQL DB
      it('Fail to Update with Undefined BookingID', function(done) {
        chai.request(app)
          .put('/api/customer?HotelID=58566')
          .type('application/json')
          .send({
            ...ReservationObjs[0],
            BookingID: undefined
          })
          .then((res) => {

            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Undefined BookingID');
            done();
          })
          .catch(err => done(err));
      });

      it('Fail to Update with NaN BookingID', function(done) {
        chai.request(app)
          .put('/api/customer?HotelID=58566')
          .type('application/json')
          .send({
            ...ReservationObjs[0],
            BookingID: 'string'
          })
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Undefined BookingID');
            done();
          })
          .catch(err => done(err));
      });

      it('Fail to Update with Nonexistent BookingID', function(done) {
        chai.request(app)
          .put('/api/customer?HotelID=58566')
          .type('application/json')
          .send({
            ...ReservationObjs[0],
            BookingID: 2020,
          })
          .then((res) => {
            expect(res).to.have.status(400);
            done();
          })
          .catch(err => done(err));
      });

      it('Fail to Update with Missing Fields', function(done) {
        chai.request(app)
          .post('/api/customer?HotelID=58566&roomType=S')
          .type('application/json')
          .send({
            exists: true,
            BookingID: 200,
          })
          .then((res) => {
            expect(res).to.have.status(400);
            done();
          })
          .catch(err => done(err));
      });

      it('Succesfully Update (1)', function(done) {
        chai.request(app)
          .put('/api/customer?HotelID=58566')
          .type('application/json')
          .send({
            ...ReservationObjs[0],
            firstName: 'Tylerr',
            checkIn: '2020-11-23',
            pricePaid: 200
          })
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.keys('BookingID', 'CustomerID', 'firstName', 'lastName', 'ReservationID', 'RoomID',
            'PaymentID', 'StateID', 'pricePaid', 'tax', 'checkIn', 'checkOut', 'numGuests', 'email', 'phone', 'comments',
            'HotelID', 'StyleID', 'YearID', 'MonthID');
            expect(res.body.firstName).to.equal('Tylerr');
            expect(res.body.pricePaid).to.equal(200);
            done();
          })
          .catch(err => done(err));
      });

      it('Succesfully Update (2)', function(done) {
        chai.request(app)
          .put('/api/customer?HotelID=58566')
          .type('application/json')
          .send({
            ...ReservationObjs[1],
            firstName: 'Tyl',
            checkIn: '2020-10-23',
            pricePaid: 1000
          })
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.keys('BookingID', 'CustomerID', 'firstName', 'lastName', 'ReservationID', 'RoomID',
            'PaymentID', 'StateID', 'pricePaid', 'tax', 'checkIn', 'checkOut', 'numGuests', 'email', 'phone', 'comments',
            'HotelID', 'StyleID', 'YearID', 'MonthID');
            expect(res.body.firstName).to.equal('Tyl');
            expect(res.body.pricePaid).to.equal(1000);
            done();
          })
          .catch(err => done(err));
      });
    });
  });
});

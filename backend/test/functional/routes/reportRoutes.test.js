const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mongoose = require('mongoose');
const moment = require('moment');

chai.use(chaiHttp);
const { expect } = chai;

const mongoDB = require('../../../server/lib/mongo');
const config = require('../../../server/config/index')['test'];

const TestReservationSchema = require('../../../server/models/ReservationModel');
const TestReportSchmema = require('../../../server/models/DailyReport.js');

const CurrentTestModel = mongoose.model(
  'Reservation',
  TestReservationSchema,
  'CurrentReservation'
);

const ReportTest = mongoose.model('DailyReport', TestReportSchmema, 'DailyReport');

describe('Report Routes', function() {
  let auth;
  let app;
  let mongoStub;
  let sqlStub;
  let agendaStub;
  const ReservationObjs = [
    {
      email: 'ivanz@gamil.com',
      phone: 5058934500,
      comments: '',
      YearID: 2020,
      MonthID: 10,
      BookingID: 1,
      CustomerID: 'zoui35',
      firstName: 'Tyler',
      lastName: 'Tran',
      ReservationID: 2,
      PaymentID: 1,
      RoomID: 101,
      StateID: 'MA',
      pricePaid: 95.67,
      tax: 4.00,
      checkIn: '2020-10-18T12:00:00.000Z',
      checkOut: '2020-10-19T12:00:00.000Z',
      numGuests: 2,
      Checked: 1,
    }, {
      email: 'ivanz@gamil.com',
      phone: 5058934500,
      comments: '',
      YearID: 2020,
      MonthID: 10,
      BookingID: 2,
      CustomerID: 'dempj78',
      firstName: 'James',
      lastName: 'Demps',
      ReservationID: 2,
      PaymentID: 1,
      RoomID: 102,
      StateID: 'MA',
      pricePaid: 67.89,
      tax: 4.56,
      checkIn: '2020-10-10T12:00:00.000Z',
      checkOut: '2020-10-29T12:00:00.000Z',
      numGuests: 2,
      Checked: 1,
    }
  ];

  const reportObj = [
    {
      YearID: 2020,
      MonthID: 10,
      Date: moment().format('YYYY-MM-DD'),
      Refund: {
        Amount: 100,
        Notes: "Rm:115 Deposit Refund"
      },
      Stays:{
        101:{
          "Room": {
            BookingID: 1,
            type: "WK1",
            payment: "",
            startDate: '2020-10-19T12:00:00.000Z',
            endDate: '',
            paid: false,
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
        102:{
          "Room": {
            BookingID: 2,
            type: "NO",
            payment: "",
            startDate: '2020-10-10T12:00:00.000Z',
            endDate: '2020-10-28T12:00:00.000Z',
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
        103:{
          "Room": {},
          "HouseKeeping": {
            "status":"R",
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

  describe('CRUD Operations/Refund/Housekeeping on DailyReport Obj', function() {
    before('Establish Dependencies', function() {
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

      const promise1 = CurrentTestModel.insertMany(ReservationObjs);
      const promise2 = ReportTest.insertMany(reportObj);
      return Promise.all([promise1, promise2]);
    });

    after('Remove Dependenices', function() {
      sinon.restore();
      const promise1 = CurrentTestModel.deleteMany({}).exec();
      const promise2 = ReportTest.deleteMany({}).exec();
      return Promise.all([promise1, promise2]);
    });

    context('CRUD On DailyReportObj', function() {
      describe('GET: /api/dailyreport', function() {
        it('Fail to Get Daily Report from Undefined Date', function(done) {
          chai.request(app)
            .get('/api/dailyreport')
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Undefined Date');
              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Get Daily Report from Invalid Date', function(done) {
          chai.request(app)
            .get('/api/dailyreport?date=10090')
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Undefined Date');
              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Get Daily Report from Nonexistent Date', function(done) {
          chai.request(app)
            .get('/api/dailyreport?date=2023-10-30')
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Report Does Not Exist');
              done();
            })
            .catch(err => done(err));
        });

        it('Successfully to Get Daily Report', function(done) {
          const date = moment().format('YYYY-MM-DD');
          chai.request(app)
            .get(`/api/dailyreport?date=${date}`)
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body.Stays['101'].Room.BookingID).to.equal(1);
              expect(res.body.Stays['102'].Room.BookingID).to.equal(2);
              expect(res.body.Stays['103'].Room.BookingID).to.be.undefined;
              expect(res.body.Stays['103'].Room.startDate).to.be.undefined;
              done();
            })
            .catch(err => done(err));
        });
      });

      describe('PUT: /api/dailyreport', function() {
        it('Fail to Update Daily Report from Undefined Date', function(done) {
          chai.request(app)
            .put('/api/dailyreport')
            .type('application/json')
            .send(ReservationObjs[0])
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Undefined Date');
              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Update Daily Report from Invalid Date', function(done) {
          chai.request(app)
            .put('/api/dailyreport?date=10090')
            .type('application/json')
            .send(ReservationObjs[0])
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Undefined Date');
              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Get Daily Report from Nonexistent Date', function(done) {
          chai.request(app)
            .put('/api/dailyreport?date=2023-10-30')
            .type('application/json')
            .send(ReservationObjs[0])
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Report Does Not Exist');
              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Get Daily Report from Nonexistent BookingID', function(done) {
          chai.request(app)
            .put('/api/dailyreport?date=2023-10-30')
            .type('application/json')
            .send({
              ...ReservationObjs[0],
              BookingID: 2020
            })
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Cannot Update Checked Out Guest');
              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Update with Invalid Data', function(done) {
          const today = moment().format('YYYY-MM-DD');
          chai.request(app)
            .put(`/api/dailyreport?date=${today}`)
            .type('application/json')
            .send({
              BookingID: 2,
              type: "N",
              payment: "CC",
              startDate: '2020-10-09T12:00:00.000Z',
              endDate: '2020-10-31T12:00:00.000Z',
              paid: true,
              rate: 'string',
              tax: new Date(),
              initial: "IZ",
            })
            .then((res) => {
              expect(res).to.have.status(400);
              return ReportTest.find({})
                .then((res) => {
                  const formattedStartDate = moment(res[0].Stays['102'].Room.startDate).format('YYYY-MM-DD');
                  const formattedEndDate = moment(res[0].Stays['102'].Room.endDate).format('YYYY-MM-DD');
                  expect(formattedStartDate).to.equal(moment(reportObj[0].Stays['102'].Room.startDate).format('YYYY-MM-DD'));
                  expect(formattedEndDate).to.equal(moment(reportObj[0].Stays['102'].Room.endDate).format('YYYY-MM-DD'));

                  expect(res[0].Stays['102'].Room).to.include({
                    BookingID: 2,
                    type: "NO",
                    payment: "",
                    paid: true,
                    rate: 0,
                    tax: 0,
                    initial: "",
                  });
                  done();
                })
            })
            .catch(err => done(err));
        });

        it('Successfully Update Current Guest', function(done) {
          const today = moment().format('YYYY-MM-DD');
          chai.request(app)
            .put(`/api/dailyreport?date=${today}`)
            .type('application/json')
            .send({
              BookingID: 2,
              type: "N",
              payment: "CC",
              startDate: '2020-10-09T12:00:00.000Z',
              endDate: '2020-10-31T12:00:00.000Z',
              paid: true,
              rate: 100,
              tax: 50.67,
              initial: "IZ",
            })
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.include({
                ...ReservationObjs[1],
                checkIn: '2020-10-09T12:00:00Z',
                checkOut: '2020-11-01T12:00:00Z',
                pricePaid: 167.89,
                tax: 55.23
              });
              done();
              // pricePaid: 67.89,
              // tax: 4.56,
            })
            .catch(err => done(err));
        });

        it('Successfully Update Stayover Guest', function(done) {
          const today = moment().format('YYYY-MM-DD');
          chai.request(app)
            .put(`/api/dailyreport?date=${today}`)
            .type('application/json')
            .send({
              BookingID: 1,
              type: "S/O",
              payment: "CC",
              startDate: '2020-10-19T12:00:00.000Z',
              endDate: '2020-10-20T12:00:00.000Z',
              paid: true,
              rate: 67.89,
              tax: 78.90,
              initial: "",
            })
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.include({
                ...ReservationObjs[0],
                checkIn: '2020-10-18T12:00:00.000Z',
                checkOut: '2020-10-21T12:00:00Z',
                pricePaid: 163.56,
                tax: 82.90
              });
              done();
              // pricePaid: 95.67,
              // tax: 4.00,
            })
            .catch(err => done(err));
        });
      });
    });

    context('Refund on DailyReportObj', function() {
      describe('PUT: /api/dailyreport/refund', function() {
        it('Fail to Update Refund from Undefined Date', function(done) {
          chai.request(app)
            .put('/api/dailyreport/refund')
            .type('application/json')
            .send({
              exists: true
            })
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Undefined Date');
              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Update Refund from Nonexistent Date', function(done) {
          chai.request(app)
            .put('/api/dailyreport/refund')
            .type('application/json')
            .send({
              exists: true,
              date: '2023-11-12',
              amount: 23,
              notes: 'hello'
            })
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Report is Not Defined');
              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Update Refund with Missing Data', function(done) {
          const today = moment().format('YYYY-MM-DD');
          chai.request(app)
            .put(`/api/dailyreport/refund`)
            .type('application/json')
            .send({
              date: today,
            })
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Cannot Update with Invalid Data');
              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Update Refund with Invalid Data', function(done) {
          const today = moment().format('YYYY-MM-DD');
          chai.request(app)
            .put(`/api/dailyreport/refund`)
            .type('application/json')
            .send({
              date: today,
              amount: 'string',
              notes: new Date(),
            })
            .then((res) => {
              expect(res).to.have.status(400);
              return ReportTest.find({})
                .then((res) => {

                  expect(res[0].Refund).to.include({
                    Amount: 100,
                    Notes: "Rm:115 Deposit Refund"
                  });
                  done();
                })
            })
            .catch(err => done(err));
        });

        it('Successfully Update Refund', function(done) {
          const today = moment().format('YYYY-MM-DD');
          chai.request(app)
            .put(`/api/dailyreport/refund`)
            .type('application/json')
            .send({
              date: today,
              amount: 200,
              notes: 'Rm:115 and 120 Deposit',
            })
            .then((res) => {
              expect(res).to.have.status(200);
              return ReportTest.find({})
                .then((res) => {
                  expect(res[0].Refund).to.include({
                    Amount: 200,
                    Notes: 'Rm:115 and 120 Deposit',
                  });
                  done();
                })
            })
            .catch(err => done(err));
        });
      });
    });

    context('Update Housekeeping Sheet', function() {
      describe('PUT: /api/dailyreport/housekeeping', function() {
        it('Fail to Update Housekeeping from Undefined Date', function(done) {
          chai.request(app)
            .put('/api/dailyreport/housekeeping')
            .type('application/json')
            .send({
              status: "O",
              type: "W",
              houseKeeper: "",
              notes: ""
            })
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Undefined Date');
              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Update Housekeeping from Nonexistent Date', function(done) {
          chai.request(app)
            .put('/api/dailyreport/housekeeping?date=2023-12-23')
            .type('application/json')
            .send({
              RoomID: 124,
              status: "O",
              type: "W",
              houseKeeper: "",
              notes: ""
            })
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('HouseKeeping Record Does Not Exist');
              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Update Housekeeping with Missing Data', function(done) {
          const today = moment().format('YYYY-MM-DD');
          chai.request(app)
            .put(`/api/dailyreport/housekeeping?date=${today}`)
            .type('application/json')
            .send({
              exists: true
            })
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Cannot Update with Undefined Data');
              return ReportTest.find({})
                .then((res) => {
                  expect(res[0].Stays['101'].HouseKeeping).to.include({
                    status: "O",
                    type: "W",
                    houseKeeper: "",
                    notes: ""
                  });
                  expect(res[0].Stays['102'].HouseKeeping).to.include({
                    status: "O",
                    type: "W",
                    houseKeeper: "",
                    notes: ""
                  });
                  expect(res[0].Stays['103'].HouseKeeping).to.include({
                    status: "R",
                    type: "W",
                    houseKeeper: "",
                    notes: ""
                  });
                  done();
                });
            })
            .catch(err => done(err));
        });

        it('Successfully Update Housekeeping', function(done) {
          const today = moment().format('YYYY-MM-DD');
          chai.request(app)
            .put(`/api/dailyreport/housekeeping?date=${today}`)
            .type('application/json')
            .send({
              RoomID: 101,
              status: "C",
              type: "S",
              houseKeeper: "Shelly",
              notes: "Really Bad"
            })
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body.Stays['101'].HouseKeeping).to.include({
                status: "C",
                type: "S",
                houseKeeper: "Shelly",
                notes: "Really Bad"
              });
              done();
            })
            .catch(err => done(err));
        });
      });
    });
  });


});

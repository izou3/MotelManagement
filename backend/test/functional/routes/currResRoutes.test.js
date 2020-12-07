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

const ReportTest = mongoose.model('DailyReport', TestReportSchmema, 'DailyReport');

describe('Current Reservation Routes', function() {
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
      BookingID: 0,
      CustomerID: 'zoui35',
      firstName: 'Ivan',
      lastName: 'Zou',
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
      HotelID: 58566,
      StyleID: 0
    }, {
      email: 'ivanz@gamil.com',
      phone: 5058934500,
      comments: '',
      YearID: 2020,
      MonthID: 10,
      BookingID: 1,
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
      HotelID: 58566,
      StyleID: 0
    }
  ];

  const newReservationChecked2 = {
    email: 'ivanz@gamil.com',
    phone: 5058934500,
    comments: '',
    YearID: 2020,
    MonthID: 10,
    BookingID: 2,
    CustomerID: 'kals67',
    firstName: 'Sahil',
    lastName: 'Kale',
    ReservationID: 2,
    PaymentID: 1,
    RoomID: 103,
    StateID: 'MA',
    pricePaid: 45,
    tax: 5,
    checkIn: '2020-10-19T12:00:00.000Z',
    checkOut: '2020-10-20T12:00:00.000Z',
    numGuests: 2,
    Checked: 2,
    HotelID: 58566,
    StyleID: 0
  }

  const newReservationChecked1 = {
    email: 'ivanz@gamil.com',
    phone: 5058934500,
    comments: '',
    YearID: 2020,
    MonthID: 10,
    BookingID: 3,
    CustomerID: 'guyb45',
    firstName: 'Ben',
    lastName: 'Guy',
    ReservationID: 2,
    PaymentID: 1,
    RoomID: 104,
    StateID: 'MA',
    pricePaid: 100,
    tax: 10,
    checkIn: '2020-10-19T12:00:00.000Z',
    checkOut: '2020-10-25T12:00:00.000Z',
    numGuests: 2,
    Checked: 1,
    HotelID: 58566,
    StyleID: 0
  }

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
            BookingID: 0,
            type: "WK1",
            payment: "",
            startDate: '2020-10-18T12:00:00.000Z',
            endDate: '',
            paid: false,
            rate: 0,
            tax: 0,
            initial: "",
          },
          "HouseKeeping": {
            status: "C",
            type: "W",
            houseKeeper: "",
            notes: ""
          }
        },
        "102":{
          "Room": {
            BookingID: 1,
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
            "status":"C",
            "type":"W",
            "houseKeeper":"",
            "notes":""
          }
        },
        "103":{
          "Room": {},
          "HouseKeeping": {
            "status":"C",
            "type":"W",
            "houseKeeper":"",
            "notes":""
          }
        },
        "104":{
          "Room": {},
          "HouseKeeping": {
            "status":"C",
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

  describe('CRUD Routes for Current Reservation', function() {
    before('Establish Dependencies', function() {
      auth = require('../../../server/middlewares/AuthMiddlewares');
      sinon.stub(auth, 'loginRequired').callsFake(function(req, res, next) {
        return next();
      });

      agendaStub = {
        now: sinon.stub(),
      };

      mongoStub = sinon.stub();

      sqlStub = sinon.stub();

      app = require('../../../server/index')({ values: [mongoStub, sqlStub], agenda: agendaStub });

      const promise1 = CurrentTestModel.insertMany(ReservationObjs);
      const promise2 = ReportTest.insertMany(reportObj);
      return Promise.all([promise1, promise2]);
    });

    after('Remove Dependenices', function() {
      auth.loginRequired.restore();

      const promise1 = PendingTestModel.deleteMany({}).exec();
      const promise2 = CurrentTestModel.deleteMany({}).exec();
      const promise3 = DeleteTestModel.deleteMany({}).exec();
      const promise4 = ReportTest.deleteMany({}).exec();
      return Promise.all([promise1, promise2, promise3, promise4]);
    });

    context('GET /api/reservation/CurrReservation', function() {
      it('Get all Reservations in Current', function(done) {
        chai.request(app)
          .get('/api/reservation/CurrReservation?HotelID=58566')
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect (res.body.length).to.equal(2);
            expect(res.body[0]).to.have.keys('CustomerID', 'BookingID', 'firstName', 'lastName', 'email', 'numGuests',
            'phone', 'pricePaid', 'tax', 'PaymentID', 'ReservationID', 'RoomID', 'StateID', 'checkIn', 'checkOut', 'comments',
            'Checked', 'YearID', 'MonthID', 'HotelID', 'StyleID');
            done();
          })
          .catch(err => done(err));
      });
    });

    context('POST /api/reservation/CurrReservation', function() {
      describe('Create with Checked=2', function() {
        // ERROR
        it('Successfully Create Reservation with Checked=2', function(done) {
          chai.request(app)
            .post('/api/reservation/CurrReservation?HotelID=58566&roomType=S')
            .type('application/json')
            .send(newReservationChecked2)
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.include(newReservationChecked2);
              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Create Reservation with Checked=2 with Missing Fields', function(done) {
          chai.request(app)
            .post('/api/reservation/CurrReservation?HotelID=58566&roomType=S')
            .type('application/json')
            .send({ exists: true })
            .then((res) => {
              expect(res).to.have.status(400);
              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Create Reservation with Checked=2 with Invalid Fields', function(done) {
          chai.request(app)
            .post('/api/reservation/CurrReservation?HotelID=58566&roomType=S')
            .type('application/json')
            .send({
              ...newReservationChecked2,
              checkIn: 40,
              checkOut: Math.random(),
              numGuests: 'string',
              Checked: new Date(),
            })
            .then((res) => {
              expect(res).to.have.status(400);
              done();
            })
            .catch(err => done(err));
        });
      });

      describe('Create with Checked=1', function() {
        it('Successfully Create Reservation with Checked=1', function(done) {
          chai.request(app)
            .post('/api/reservation/CurrReservation?HotelID=58566&roomType=W')
            .type('application/json')
            .send(newReservationChecked1)
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.an('Object');
              expect(res.body.Stays['104'].Room).to.include({
                BookingID: 3,
                type: "",
                payment: "",
                startDate: '2020-10-19T12:00:00.000Z',
                endDate: '2020-10-24T12:00:00.000Z',
                paid: true,
                rate: 100,
                tax: 10,
                initial: "",
              });
              expect(res.body.Stays['104'].HouseKeeping).to.include({
                status: "O",
                type: "W",
                houseKeeper: "",
                notes: ""
              });

              return CurrentTestModel.find({})
                .then((res) => {
                  expect(res.length).to.equal(4);
                  done();
                });
            })
            .catch(err => done(err));
        });

        it('Fail to Create Reservation with Checked=1 with Missing Fields', function(done) {
          chai.request(app)
            .post('/api/reservation/CurrReservation?HotelID=58566&roomType=S')
            .type('application/json')
            .send({ exists: true, Checked: 1 })
            .then((res) => {
              expect(res).to.have.status(400);
              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Create Reservation with Checked=2 with Invalid Fields', function(done) {
          chai.request(app)
            .post('/api/reservation/CurrReservation?HotelID=58566&roomType=S')
            .type('application/json')
            .send({
              ...newReservationChecked1,
              checkIn: 40,
              pricePaid: '200',
              checkOut: Math.random(),
              numGuests: 'string',
              Checked: new Date(),
            })
            .then((res) => {
              expect(res).to.have.status(400);

              return ReportTest.find({})
                .then((res) => {
                  // Ignore Date Objects
                  expect(res[0].Stays['104'].Room).to.include({
                    BookingID: 3,
                    type: "",
                    payment: "",
                    paid: true,
                    rate: 100,
                    tax: 10,
                    initial: "",
                  });
                  done();
                });
            })
            .catch(err => done(err));
        });
      });
    });

    context('PUT /api/reservation/CurrReservation', function() {
      describe('Fail to Update with Undefined BookingID', function() {
        it('Fail with Undefined BookingID', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&roomType=S')
            .type('application/json')
            .send({ exists: true })
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Undefined BookingID');
              done();
            })
            .catch(err => done(err));
        });

        it('Fail with Invalid BookingID', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=string&roomType=S')
            .type('application/json')
            .send({ exists: true })
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Undefined BookingID');
              done();
            })
            .catch(err => done(err));
        });
      });

      describe('Update Current Reservation w/ Checked = 2', function() {
        it('Update CurrReservation w/ Checked = 2 Successfully', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=2')
            .type('application/json')
            .send({
              ...newReservationChecked2,
              pricePaid: 100,
              StateID: 'SD',
            })
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.an('Object');
              expect(res.body).to.include({
                ...newReservationChecked2,
                pricePaid: 100,
                StateID: 'SD',
              });
              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Update CurrRes w/ Checked = 2 from Non-existent BookingID', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=200')
            .type('application/json')
            .send({
              ...newReservationChecked2,
              BookingID: 200,
            })
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Reservation Does Not Exist');

              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Update CurrRes w/ Checked = 2 from Missing All Fields', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=2')
            .type('application/json')
            .send({
              exists: true,
            })
            .then((res) => {
              expect(res).to.have.status(400);
              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Update CurrRes w/ Checked = 2 from Invalid Fields', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=2')
            .type('application/json')
            .send({
              ...newReservationChecked2,
              checkIn: 40,
              pricePaid: '200',
              checkOut: Math.random(),
              numGuests: 'string',
              Checked: new Date(),
            })
            .then((res) => {
              expect(res).to.have.status(400);
              done();
            })
            .catch(err => done(err));
        });
      });

      describe('Update Current Reservation w/ Checked = 1', function() {
        it('Update New CurrReservation w/ Checked = 1 Successfully (Price)', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=3')
            .type('application/json')
            .send({
              ...newReservationChecked1,
              pricePaid: 200,
              tax: 100,
              StateID: 'SD',
            })
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.an('Object');
              expect(res.body.UpdatedRes).to.include({
                ...newReservationChecked1,
                pricePaid: 200,
                tax: 100,
                StateID: 'SD',
              });
              expect(res.body.UpdatedReport.Stays['104'].Room).to.include({
                BookingID: 3,
                type: "",
                payment: "",
                startDate: '2020-10-19T12:00:00.000Z',
                endDate: '2020-10-24T12:00:00.000Z',
                paid: true,
                rate: 200,
                tax: 100,
                initial: "",
              });
              done();
            })
            .catch(err => done(err));
        });

        it('Update New CurrReservation w/ Checked = 1 Successfully (Date)', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=3')
            .type('application/json')
            .send({
              ...newReservationChecked1,
              pricePaid: 200,
              tax: 100,
              StateID: 'SD',
              checkIn: '2020-10-15T12:00:00.000Z',
              checkOut: '2020-10-30T12:00:00.000Z',
            })
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.an('Object');
              expect(res.body.UpdatedRes).to.include({
                ...newReservationChecked1,
                pricePaid: 200,
                tax: 100,
                checkIn: '2020-10-15T12:00:00.000Z',
                checkOut: '2020-10-30T12:00:00.000Z',
                StateID: 'SD',
              });
              expect(res.body.UpdatedReport.Stays['104'].Room).to.include({
                BookingID: 3,
                type: "",
                payment: "",
                startDate: '2020-10-15T12:00:00.000Z',
                endDate: '2020-10-29T12:00:00.000Z',
                paid: true,
                rate: 200,
                tax: 100,
                initial: "",
              });
              done();
            })
            .catch(err => done(err));
        });

        it('Update New CurrReservation w/ Checked = 1 Successfully (RoomID)', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=3')
            .type('application/json')
            .send({
              ...newReservationChecked1,
              pricePaid: 200,
              tax: 100,
              StateID: 'SD',
              checkIn: '2020-10-15T12:00:00.000Z',
              checkOut: '2020-10-30T12:00:00.000Z',
              RoomID: 103
            })
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.an('Object');
              expect(res.body.UpdatedRes).to.include({
                ...newReservationChecked1,
                pricePaid: 200,
                tax: 100,
                StateID: 'SD',
                checkIn: '2020-10-15T12:00:00.000Z',
                checkOut: '2020-10-30T12:00:00.000Z',
                RoomID: 103
              });
              expect(res.body.UpdatedReport.Stays['103'].Room).to.include({
                BookingID: 3,
                type: "",
                payment: "",
                startDate: '2020-10-15T12:00:00.000Z',
                endDate: '2020-10-29T12:00:00.000Z',
                paid: true,
                rate: 200,
                tax: 100,
                initial: "",
              });
              expect(res.body.UpdatedReport.Stays['103'].HouseKeeping).to.include({
                status: "O",
                houseKeeper: "",
                notes: ""
              });
              expect(res.body.UpdatedReport.Stays['104'].HouseKeeping).to.include({
                status: "C",
                houseKeeper: "",
                notes: ""
              });

              expect(res.body.UpdatedReport.Stays['104'].Room.BookingID).to.be.undefined;
              expect(res.body.UpdatedReport.Stays['104'].Room.startDate).to.be.undefined;
              expect(res.body.UpdatedReport.Stays['104'].Room.paid).to.be.undefined;

              done();
            })
            .catch(err => done(err));
        });

        it('Update Existing CurrReservation w/ Checked = 1 Successfully (Price)', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=0')
            .type('application/json')
            .send({
              ...ReservationObjs[0],
              checkIn: '2020-10-11T12:00:00.000Z',
            })
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.an('Object');
              expect(res.body.UpdatedRes).to.include({
                ...ReservationObjs[0],
                checkIn: '2020-10-11T12:00:00.000Z',
              });
              expect(res.body.UpdatedReport.Stays['101'].Room).to.include({
                BookingID: 0,
                type: "WK1",
                payment: "",
                startDate: '2020-10-11T12:00:00.000Z',
                endDate: '2020-10-18T12:00:00.000Z',
                paid: false,
                rate: 0,
                tax: 0,
                initial: "",
              });

              done();
            })
            .catch(err => done(err));
        });

        it('Update Existing CurrReservation w/ Checked = 1 Successfully (Price)', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=1')
            .type('application/json')
            .send({
              ...ReservationObjs[1],
              pricePaid: 70.56,
              tax: 20,
            })
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.an('Object');
              expect(res.body.UpdatedRes).to.include({
                ...ReservationObjs[1],
                pricePaid: 70.56,
                tax: 20,
              });
              expect(res.body.UpdatedReport.Stays['102'].Room).to.include({
                BookingID: 1,
                type: "NO",
                payment: "",
                startDate: '2020-10-10T12:00:00.000Z',
                endDate: '2020-10-28T12:00:00.000Z',
                paid: true,
                rate: 2.67,
                tax: 15.44,
                initial: "",
              });
              // pricePaid: 67.89,
              // tax: 4.56,
              done();
            })
            .catch(err => done(err));
        });

        it('Update Existing CurrReservation w/ Checked = 1 Successfully (Date) (1)', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=1')
            .type('application/json')
            .send({
              ...ReservationObjs[1],
              pricePaid: 70.56,
              tax: 20,
              checkIn: '2020-10-11T12:00:00.000Z',
              checkOut: '2020-11-24T12:00:00.000Z',
            })
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.an('Object');
              expect(res.body.UpdatedRes).to.include({
                ...ReservationObjs[1],
                pricePaid: 70.56,
                tax: 20,
                checkIn: '2020-10-11T12:00:00.000Z',
                checkOut: '2020-11-24T12:00:00.000Z',
              });
              expect(res.body.UpdatedReport.Stays['102'].Room).to.include({
                BookingID: 1,
                type: "NO",
                payment: "",
                startDate: '2020-10-11T12:00:00.000Z',
                endDate: '2020-11-23T12:00:00.000Z',
                paid: true,
                rate: 2.67,
                tax: 15.44,
                initial: "",
              });

              done();
            })
            .catch(err => done(err));
        });

        it('Update Existing CurrReservation w/ Checked = 1 Successfully (Date) (2)', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=0')
            .type('application/json')
            .send({
              ...ReservationObjs[0],
              pricePaid: 200,
              tax: 100,
              checkIn: '2020-10-11T12:00:00.000Z',
              checkOut: '2020-11-24T12:00:00.000Z',
            })
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.an('Object');
              expect(res.body.UpdatedRes).to.include({
                ...ReservationObjs[0],
                pricePaid: 200,
                tax: 100,
                checkIn: '2020-10-11T12:00:00.000Z',
                checkOut: '2020-11-24T12:00:00.000Z',
              });
              expect(res.body.UpdatedReport.Stays['101'].Room).to.include({
                BookingID: 0,
                type: "WK1",
                payment: "",
                startDate: '2020-10-11T12:00:00.000Z',
                endDate: '2020-11-23T12:00:00.000Z',
                paid: true,
                rate: 104.33,
                tax: 96,
                initial: "",
              });
              // pricePaid: 95.67,
              // tax: 4.00,
              done();
            })
            .catch(err => done(err));
        });

        it('Update CurrRes w/ Checked = 1 Fail w/ Nonexistent BookingID', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=200')
            .type('application/json')
            .send({
              ...ReservationObjs[0],
              BookingID: 200,
            })
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Reservation Does Not Exist');

              done();
            })
            .catch(err => done(err));
        });

        it('Update CurrRes w/ Checked = 1 Fail w/ Invalid Data', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=0')
            .type('application/json')
            .send({
              ...ReservationObjs[0],
              checkIn: 40,
              pricePaid: '1000',
              checkOut: Math.random(),
              numGuests: 'string',
              Checked: new Date(),
            })
            .then((res) => {
              expect(res).to.have.status(400);
              done();
            })
            .catch(err => done(err));
        });
      });

      // Right now Room 101-103 are occupied due to the update
      // And newReservationChecked2 is in arrivals with room 103
      describe('PUT: /api/reservation/CurrReservation?checkIn=true', function() {
        it('Fail to Check In Reservation with Non-existent BookingID', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=200&checkIn=true')
            .type('application/json')
            .send({
              ...newReservationChecked2,
              BookingID: 200,
            })
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Reservation Does Not Exist');

              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Check In Reservation with Invalid Fields', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=2&checkIn=true')
            .type('application/json')
            .send({
              ...newReservationChecked2,
              checkIn: 40,
              pricePaid: '200',
              checkOut: Math.random(),
              numGuests: 'string',
              Checked: new Date(),
            })
            .then((res) => {
              expect(res).to.have.status(400);
              done();
            })
            .catch(err => done(err));
        });

        it('Check In Reservation Successfully', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=2&checkIn=true&roomType=W')
            .type('application/json')
            .send({
              ...newReservationChecked2,
              RoomID: 104,
            })
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.an('Object');
              expect(res.body.UpdatedRes).to.include({
                ...newReservationChecked2,
                RoomID: 104,
              });
              expect(res.body.UpdatedReport.Stays['104'].Room).to.include({
                BookingID: 2,
                type: "",
                payment: "",
                startDate: '2020-10-19T12:00:00.000Z',
                endDate: '2020-10-19T12:00:00.000Z',
                paid: true,
                rate: 45,
                tax: 5,
                initial: "",
              });
              expect(res.body.UpdatedReport.Stays['104'].HouseKeeping).to.include({
                status: "O",
                type: "W",
                houseKeeper: "",
                notes: ""
              });
              done();
            })
            .catch(err => done(err));
        });
      });

      // Right Now All Reservations are checked in w/
      // 101: ReservationObjs[0] BKID: 0
      // 102: ReservationObjs[1] BKID: 1
      // 103: newReservationChecked1 BKID: 3
      // 104: newReservationChecked2 BKID: 2
      describe('PUT: /api/reservation/CurrReservation?moveToArr=true', function() {
        it('Fail to Move Reservation with Non-existent BookingID', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=200&moveToArr=true')
            .type('application/json')
            .send({
              ...newReservationChecked2,
              BookingID: 200,
            })
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Reservation Does Not Exist');

              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Move Reservation with Invalid Fields', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=3&moveToArr=true')
            .type('application/json')
            .send({
              ...newReservationChecked2,
              checkIn: 40,
              pricePaid: '200',
              checkOut: Math.random(),
              numGuests: 'string',
              Checked: new Date(),
            })
            .then((res) => {
              expect(res).to.have.status(400);
              done();
            })
            .catch(err => done(err));
        });

        it('Move Reservation to Pending Successfully', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=3&moveToArr=true&roomType=S')
            .type('application/json')
            .send({
              ...newReservationChecked1,
              RoomID: 103,
            })
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.an('Object');

              expect(res.body.Stays['103'].Room.BookingID).to.be.undefined;
              expect(res.body.Stays['103'].Room.startDate).to.be.undefined;

              expect(res.body.Stays['101'].Room.BookingID).to.equal(0);
              expect(res.body.Stays['102'].Room.BookingID).to.equal(1);
              expect(res.body.Stays['104'].Room.BookingID).to.equal(2);

              expect(res.body.Stays['103'].HouseKeeping).to.include({
                status: "C",
                type: "S",
                houseKeeper: "",
                notes: ""
              });
              done();
            })
            .catch(err => done(err));
          });
      });

      // Right Now All Reservations w/
      // 101: ReservationObjs[0] BKID: 0
      // 102: ReservationObjs[1] BKID: 1
      // 103: {}
      // 104: newReservationChecked2 BKID: 2
      describe('PUT: /api/reservation/CurrReservation?dateChange=true', function() {
        it('Fail to Move Reservation with Non-existent BookingID', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=200&dateChange=true')
            .type('application/json')
            .send({
              ...newReservationChecked2,
              BookingID: 200,
            })
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('Reservation Does Not Exist');

              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Move Reservation with Missing Fields', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=3&dateChange=true')
            .type('application/json')
            .send({
              exists: true,
            })
            .then((res) => {
              expect(res).to.have.status(400);
              done();
            })
            .catch(err => done(err));
        });

        it('Fail to Check In Reservation with Invalid Fields', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=3&dateChange=true')
            .type('application/json')
            .send({
              ...newReservationChecked2,
              checkIn: 40,
              pricePaid: '200',
              checkOut: Math.random(),
              numGuests: 'string',
              Checked: new Date(),
            })
            .then((res) => {
              expect(res).to.have.status(400);

              done();
            })
            .catch(err => done(err));
        });

        it('Move to Pending Successfully', function(done) {
          chai.request(app)
            .put('/api/reservation/CurrReservation?HotelID=58566&BookingID=3&dateChange=true')
            .type('application/json')
            .send(newReservationChecked1)
            .then((res) => {
              expect(res).to.have.status(200);

              return CurrentTestModel.find({})
                .then((res1) => {
                  expect(res1).to.be.an('array');
                  expect(res1.length).to.equal(3);

                  return ReportTest.find({})
                    .then((res2) => {
                      expect(res2[0].Stays['103'].Room.BookingID).to.be.undefined;
                      expect(res2[0].Stays['101'].Room.BookingID).to.equal(0);
                      expect(res2[0].Stays['102'].Room.BookingID).to.equal(1);
                      expect(res2[0].Stays['104'].Room.BookingID).to.equal(2);

                      return PendingTestModel.find({})
                        .then((res3) => {
                          expect(res3).to.be.an('array');
                          expect(res3.length).to.equal(1);
                          done();
                        });
                    });
                });
            })
            .catch(err => done(err));
          });
      });
    });

    context('DELETE /api/reservation/CurrReservation', function() {
      before('Insert Reservation into Current', function() {
        return CurrentTestModel.insertMany([{
          ...newReservationChecked1,
          BookingID: 2020112290,
          Checked: 0,
        }]);
      });

      it('Fail to Delete with Undefined BookingID', function(done) {
        chai.request(app)
          .delete('/api/reservation/CurrReservation?HotelID=58566')
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Undefined BookingID');
            done();
          })
          .catch(err => done(err));
      });

      it('Fail to Delete with NaN BookingID', function(done) {
        chai.request(app)
          .delete('/api/reservation/CurrReservation?HotelID=58566&BookingID=string')
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Undefined BookingID');
            done();
          })
          .catch(err => done(err));
      });

      it('Fail to Delete with Non-existent BookingID', function(done) {
        chai.request(app)
          .delete('/api/reservation/CurrReservation?HotelID=58566&BookingID=2020')
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Reservation Does Not Exist');
            done();
          })
          .catch(err => done(err));
      });

      it('Successfully Delete Reservation w/ Checked = 0/2', function(done) {
        chai.request(app)
          .delete('/api/reservation/CurrReservation?HotelID=58566&BookingID=2020112290')
          .then((res1) => {
            expect(res1).to.have.status(200);

            return CurrentTestModel.find({})
            .then((res2) => {
              expect(res2).to.be.an('array');
              expect(res2.length).to.equal(3);

              return DeleteTestModel.find({})
                .then((res3) => {
                  expect(res3).to.be.an('array');
                  expect(res3.length).to.equal(1);
                  done();
                });
            });
          })
          .catch(err => done(err));
      });
    });
  });
});

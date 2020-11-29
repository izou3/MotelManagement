const chai = require('chai');
const chaiHttp = require('chai-http');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const logger = require('morgan');
const mongoose = require('mongoose');

chai.use(chaiHttp);
const { expect } = chai;

const mongoDB = require('../../../server/lib/mongo');
const SQLPool = require('../../../server/lib/sql');
const config = require('../../../server/config/index')['test'];

const TestReservationSchema = require('../../../server/models/ReservationModel');
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

const PendingTestModel = mongoose.model(
  'Reservation',
  TestReservationSchema,
  'PendingReservation',
);

describe('Reservation Search Routes', function() {
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
      checkIn: '2020-10-27T12:00:00.000+00:00',
      checkOut: '2020-10-28T12:00:00.000+00:00',
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
      checkIn: '2020-10-25T12:00:00.000+00:00',
      checkOut: '2020-11-01T12:00:00.000+00:00',
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
      lastName: 'Henry',
      ReservationID: 2,
      PaymentID: 1,
      RoomID: 102,
      StateID: 'MA',
      pricePaid: 67.89,
      tax: 4.56,
      checkIn: '2020-07-17T12:00:00.000+00:00',
      checkOut: '2020-07-25T12:00:00.000+00:00',
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
      firstName: 'James',
      lastName: 'Zou',
      ReservationID: 2,
      PaymentID: 1,
      RoomID: 102,
      StateID: 'MA',
      pricePaid: 67.89,
      tax: 4.56,
      checkIn: '2020-10-30T12:00:00.000+00:00',
      checkOut: '2020-10-31T12:00:00.000+00:00',
      numGuests: 2,
      Checked: 2,
    }
  ];

  before('Establish Mongo Connection', function() {
    return mongoDB.connectMongo(config.database.mongo);
  });

  after('Close Mongo Connection', function() {
    return mongoose.connection.close();
  });

  context('Search Pending/Current/Delete Reservations', function() {
    let auth;
    let app;
    let mongoStub;
    let sqlStub;
    let agendaStub;

    before('Insert Reservations into Collections', function() {
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

      const promise1 = CurrentTestModel.insertMany(reservations);
      const promise2 = PendingTestModel.insertMany(reservations);
      const promise3 = DeleteTestModel.insertMany(reservations);
      return Promise.all([promise1, promise2, promise3]);
    });

    after('Removed Reservations from Collections', function() {
      auth.loginRequired.restore();
      const promise1 = PendingTestModel.deleteMany({}).exec();
      const promise2 = CurrentTestModel.deleteMany({}).exec();
      const promise3 = DeleteTestModel.deleteMany({}).exec();
      return Promise.all([promise1, promise2, promise3]);
    });

    describe('/api/search/reservations/firstName', function() {
      it('Should Return No Reservations Found', function(done) {
        chai.request(app)
          .get('/api/search/reservations/firstName?firstName=Henry')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Failed to Find a Match');
            done();
          });
      });

      it('Should Return 6 Results Found', function(done) {
        chai.request(app)
          .get('/api/search/reservations/firstName?firstName=Ivan')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(6);
            done();
          });
      });

      it('Should Return 2 Results Found', function(done) {
        chai.request(app)
          .get('/api/search/reservations/firstName?firstName=James')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(2);
            done();
          });
      });

      it('Should Error From Invalid Date', function(done) {
        chai.request(app)
          .get('/api/search/reservations/firstName?firstName=909352')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
          });
      });
    });

    describe('/api/search/reservations/BookingID', function(done) {
      it('Should Return Error No Results Found', function(done) {
        chai.request(app)
          .get('/api/search/reservations/BookingID?BookingID=90')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Failed to Find a Match');
            done();
          });
      });

      it('Should Return 1 Result Found', function(done) {
        chai.request(app)
          .get('/api/search/reservations/BookingID?BookingID=0')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('Object');
            expect(res.body).to.have.property('BookingID');
            done();
          });
      });

      it('Should Error From Invalid Date', function(done) {
        chai.request(app)
          .get('/api/search/reservations/BookingID?BookingID=string')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
          });
      });
    });

    describe('/api/search/reservations/checkIn', function(done) {
      it('Should Return 3 Results Found', function(done) {
        chai.request(app)
          .get('/api/search/reservations/checkIn?start=2020-10-25&end=2020-10-30')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(2);
            done();
          });
      });

      it('Should Return Error No Results Found', function(done) {
        chai.request(app)
          .get('/api/search/reservations/checkIn?start=2020-10-31&end=2020-11-01')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Failed to Find a Match');
            done();
          });
      });

      it('Should Error From Invalid Date', function(done) {
        chai.request(app)
          .get('/api/search/reservations/checkIn?start=2020&end=string')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
          });
      });
    });

    describe('/api/search/reservations/checkOut', function() {
      it('Should Return 2 Results Found', function(done) {
        chai.request(app)
          .get('/api/search/reservations/checkOut?start=2020-10-28&end=2020-11-01')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(2);
            done();
          });
      });

      it('Should Return Error 0 Results Found', function(done) {
        chai.request(app)
          .get('/api/search/reservations/checkOut?start=2020-07-10&end=2020-07-25')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Failed to Find a Match');
            done();
          });
      });

      it('Should Error from Invalid Date', function(done) {
        chai.request(app)
        .get('/api/search/reservations/checkOut?start=string&end=909')
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
      });
    });

    describe('/api/search/delreservations/firstName', function() {
      it('Should Return 3 Results Found', function(done) {
        chai.request(app)
          .get('/api/search/delreservations/firstName?firstName=Ivan')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(3);
            done();
          });
      });

      it('Should Return 1 Result Found', function(done) {
        chai.request(app)
        .get('/api/search/delreservations/firstName?firstName=James')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(1);
          done();
        });
      });

      it ('Should Return Error 0 Results Found', function(done) {
        chai.request(app)
          .get('/api/search/delreservations/firstName?firstName=Zach')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Failed to Find a Match');
            done();
          });
      });

      it ('Should Return Error From Invalid Name', function(done) {
        chai.request(app)
          .get('/api/search/delreservations/firstName?firstName=909323')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
          });
      });
    });

    describe('/api/search/delreservations/BookingID', function() {
      it('Should Return 1 Result Found', function(done) {
        chai.request(app)
          .get('/api/search/delreservations/BookingID?BookingID=0')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('Object');
            expect(res.body).to.have.property('BookingID');
            expect(res.body.lastName).to.equal('Zou');
            done();
          });
      });

      it('Should Return 1 Result Found', function(done) {
        chai.request(app)
        .get('/api/search/delreservations/BookingID?BookingID=1')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('Object');
          expect(res.body).to.have.property('BookingID');
          expect(res.body.lastName).to.equal('White');
          done();
        });
      });

      it('Should Return Error 0 Results Found', function(done) {
        chai.request(app)
          .get('/api/search/delreservations/BookingID?BookingID=90')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Failed to Find a Match');
            done();
          });
      });

      it('Should Return Error From Invalid BookingID', function(done) {
        chai.request(app)
          .get('/api/search/delreservations/BookingID?BookingID=hello')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
          });
      });
    });

    describe('/api/search/delreservations/checkIn', function() {
      it('Should Return 2 Result Found', function(done) {
        chai.request(app)
          .get('/api/search/delreservations/checkIn?start=2020-10-25&end=2020-10-30')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(2);
            done();
          });
      });

      it('Should Return 1 Result Found', function(done) {
        chai.request(app)
        .get('/api/search/delreservations/checkIn?start=2020-10-28&end=2020-10-31')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(1);
          done();
        });
      });

      it('Should Return Error 0 Results Found', function(done) {
        chai.request(app)
          .get('/api/search/delreservations/checkIn?start=2020-10-01&end=2020-10-25')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Failed to Find a Match');
            done();
          });
      });

      it('Should Return Error From Invalid BookingID', function(done) {
        chai.request(app)
          .get('/api/search/delreservations/checkIn?start=hello&end=yeu')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
          });
      });
    });

    describe('/api/search/delreservations/checkOut', function() {
      it('Should Return 2 Result Found', function(done) {
        chai.request(app)
          .get('/api/search/delreservations/checkOut?start=2020-10-28&end=2020-11-01')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(2);
            done();
          });
      });

      it('Should Return 1 Result Found', function(done) {
        chai.request(app)
        .get('/api/search/delreservations/checkOut?start=2020-11-01&end=2020-11-20')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(1);
          done();
        });
      });

      it('Should Return Error 0 Results Found', function(done) {
        chai.request(app)
          .get('/api/search/delreservations/checkOut?start=2020-11-02&end=2020-11-12')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Failed to Find a Match');
            done();
          });
      });

      it('Should Return Error From Invalid BookingID', function(done) {
        chai.request(app)
          .get('/api/search/delreservations/checkOut?start=2020-02-31&end=yeu')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
          });
      });
    });
  });

});

describe('Customer/BlackList Search Routes', function() {
  let auth;
  let app;
  let mongoStub;
  let agendaStub;

  before('Require Dependencies', function() {
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

    return Promise.resolve(SQLPool.connectSQL(config.database.sql))
      .then((pool) => {
        app = require('../../../server/index')({ values: [mongoStub, pool], agenda: agendaStub });
      });
  });

  after('Restore Auth Stub', function() {
    auth.loginRequired.restore();
  });

  context('Customer Search Routes', function() {

    describe('/api/search/customers/firstName', function() {
      it('Return 2 Customer Results Found', function(done) {
        chai.request(app)
          .get('/api/search/customers/firstName?firstName=Ivan')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(2);
            expect(res.body[0]).to.have.keys('CustomerID', 'BookingID', 'firstName', 'lastName', 'email', 'numGuests',
            'phone', 'pricePaid', 'tax', 'PaymentID', 'ReservationID', 'RoomID', 'StateID', 'checkIn', 'checkOut', 'Comments');
            done();
          });
      });

      it('Return 1 Customer Result Found', function(done) {
        chai.request(app)
          .get('/api/search/customers/firstName?firstName=Adam')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(1);
            expect(res.body[0]).to.have.keys('CustomerID', 'BookingID', 'firstName', 'lastName', 'email', 'numGuests',
            'phone', 'pricePaid', 'tax', 'PaymentID', 'ReservationID', 'RoomID', 'StateID', 'checkIn', 'checkOut', 'Comments');
            done();
          });
      });

      it('Return Error No Result Found', function(done) {
        chai.request(app)
          .get('/api/search/customers/firstName?firstName=juju')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal("Failed to Find Match");
            done();
          });
      });

      it('Return Error From Invalid Name', function(done) {
        chai.request(app)
          .get('/api/search/customers/firstName?firstName=0920192')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
          });
      });
    });

    describe('/api/search/customers/BookingID', function() {
      it('Should Return 1 Customer Result Found', function(done) {
        chai.request(app)
          .get('/api/search/customers/BookingID?BookingID=1023303283')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(1);
            expect(res.body[0]).to.have.keys('CustomerID', 'BookingID', 'firstName', 'lastName', 'email', 'numGuests',
            'phone', 'pricePaid', 'tax', 'PaymentID', 'ReservationID', 'RoomID', 'StateID', 'checkIn', 'checkOut', 'comments');
            done();
        });
      });

      it('Should Return Error, 0 Customer Result Found', function(done) {
        chai.request(app)
        .get('/api/search/customers/BookingID?BookingID=90923523')
        .end(function(err, res) {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal("Failed to Find Match");
          done();
        });
      });

      it('Should Return Error From Invalid BookingID', function(done) {
        chai.request(app)
          .get('/api/search/customers/BookingID?BookingID=string')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
          });
      });
    });

    describe('/api/search/customers/checkIn', function() {
      it('Should Return 2 Customer Results Found', function(done) {
        chai.request(app)
          .get('/api/search/customers/checkIn?start=2020-11-04&end=2020-11-09')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(2);
            expect(res.body[0]).to.have.keys('CustomerID', 'BookingID', 'firstName', 'lastName', 'email', 'numGuests',
            'phone', 'pricePaid', 'tax', 'PaymentID', 'ReservationID', 'RoomID', 'StateID', 'checkIn', 'checkOut', 'Comments');
            done();
        });
      });

      it('Should Return Error 0 Customer Results Found', function(done) {
        chai.request(app)
          .get('/api/search/customers/checkIn?start=2020-10-02&end=2020-10-20')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal("Failed to Find Match");
            done();
        });
      });

      it('Should Return Error from Invalid Date', function(done) {
        chai.request(app)
          .get('/api/search/customers/checkIn?start=string&end=2020')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
        });
      });
    });

    describe('/api/search/customers/checkOut', function() {
      it('Should Return 1 Customer Results Found', function(done) {
        chai.request(app)
          .get('/api/search/customers/checkOut?start=2020-11-11&end=2020-11-19')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(1);
            expect(res.body[0]).to.have.keys('CustomerID', 'BookingID', 'firstName', 'lastName', 'email', 'numGuests',
            'phone', 'pricePaid', 'tax', 'PaymentID', 'ReservationID', 'RoomID', 'StateID', 'checkIn', 'checkOut', 'Comments');
            done();
        });
      });

      it('Should Return Error 0 Customer Results Found', function(done) {
        chai.request(app)
          .get('/api/search/customers/checkOut?start=2020-10-08&end=2020-10-31')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal("Failed to Find Match");
            done();
        });
      });

      it('Should Return Error from Invalid Date', function(done) {
        chai.request(app)
          .get('/api/search/customers/checkOut?start=string&end=2020')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
        });
      });
    });
  });

  context('BlackList Search Routes', function() {
    describe('/api/search/blacklist/name', function() {
      it('Should Return 1 Result from BlackList', function(done) {
        chai.request(app)
          .get('/api/search/blacklist/name?firstName=Adam')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(1);
            expect(res.body[0]).to.have.keys('BookingID', 'firstName', 'lastName', 'comments');
            done();
        });
      });

      it('Should Return 0 Results from BlackList', function(done) {
        chai.request(app)
          .get('/api/search/blacklist/name?firstName=Henry')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal("Failed to Find Match");
            done();
        });
      });

      it('Should Error From Invalid Name', function(done) {
        chai.request(app)
          .get('/api/search/blacklist/name?firstName=902932')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
        });
      });
    });

    describe('/api/search/blacklist/id', function(done) {
      it('Should Return 1 Result from BlackList', function(done) {
        chai.request(app)
          .get('/api/search/blacklist/id?BookingID=2020082721')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(1);
            expect(res.body[0]).to.have.keys('BookingID', 'firstName', 'lastName', 'comments');
            done();
        });
      });

      it('Should Return 0 Results from BlackList', function(done) {
        chai.request(app)
          .get('/api/search/blacklist/id?BookingID=20203432')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal("Failed to Find Match");
            done();
        });
      });

      it('Should Error from Invalid BookingID', function(done) {
        chai.request(app)
          .get('/api/search/blacklist/id?BookingID=string')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
        });
      });
    });
  });
});

  /**
   * The current customers already exists in the database as test objects
   *
   * {
   *    id: ParA31
   *    YearID: 2020
   *    MonthID: 11
   *    first_name: Adam
   *    last_name: Parenteau
   *    email: ivanz36x@gmail.com
   *    phone: 0,
   *    state:
   *    stays: [
   *      {
   *        BookingID: 1023303283,
   *        CustomerID: ParA31,
   *        price_paid: 89.90,
   *        tax: 45.00,
   *        check_in: 2020-11-04 07:00:00,
   *        check_out: 2020-11-05 07:00:00,
   *        num_guests: 3,
   *        ReservationID: 0,
   *        PaymentID: 0,
   *        RoomID: 120,
   *      }
   *    ]
   * }, {
   *    id: WelM01
   *    YearID: 2020
   *    MonthID: 11
   *    first_name: Mike
   *    last_name: Welch
   *    email:
   *    phone: 0,
   *    state:
   *    stays: [
   *      {
   *        BookingID: 1033457050,
   *        CustomerID: WelM01,
   *        price_paid: 90.00,
   *        tax: 45.00,
   *        check_in: 2020-11-09 07:00:00,
   *        check_out: 2020-11-11 07:00:00,
   *        num_guests: 2,
   *        ReservationID: 0,
   *        PaymentID: 0,
   *        RoomID: 120,
   *      }, {
   *        BookingID: 8023925903,
   *        CustomerID: WelM01,
   *        price_paid: 90.00,
   *        tax: 5.67,
   *        check_in: 2020-11-16 07:00:00,
   *        check_out: 2020-11-19 07:00:00,
   *        num_guests: 2,
   *        ReservationID: 0,
   *        PaymentID: 0,
   *        RoomID: 120,
   *      }
   *    ]
   * }, {
   *    id: WhiI70
   *    YearID: 2020
   *    MonthID: 11
   *    first_name: Ivan
   *    last_name: Zou
   *    email: ivanz36x@gmail.com
   *    phone: 0,
   *    state:
   *    stays: [
   *      {
   *        BookingID: 2020082721,
   *        CustomerID: WhiI70,
   *        price_paid: 45.00,
   *        tax: 4.90,
   *        check_in: 2020-10-01 08:00:00,
   *        check_out: 2020-10-07 08:00:00,
   *        num_guests: 1,
   *        ReservationID: 2,
   *        PaymentID: 1,
   *        RoomID: 106,
   *      }, {
   *        BookingID: 2374154734,
   *        CustomerID: WhiI70,
   *        price_paid: 90.00,
   *        tax: 45.00,
   *        check_in: 2020-11-04 07:00:00,
   *        check_out: 2020-11-05 07:00:00,
   *        num_guests: 2,
   *        ReservationID: 0,
   *        PaymentID: 0,
   *        RoomID: 120,
   *      }
   *    ]
   * }
   */

const chai = require('chai');
const decache = require('decache');
const chaiHttp = require('chai-http');
const sinon = require('sinon');

chai.use(chaiHttp);
const { expect } = chai;

const SQLPool = require('../../../server/lib/sql');
const config = require('../../../server/config/index')['test'];

describe('Blacklist Routes', function() {
  let auth;
  let app;
  let agendaStub;
  let mongoStub;

  const BlackListCustomer = {
    BookingID: 2020112189,
    comments: 'He Smoked in the Room',
  };

  before('Require Dependencies', function() {
    decache('../../../server/index');

    auth = require('../../../server/services/Staff');
    sinon.stub(auth, 'loginRequired').callsFake(function(req, res, next) {
      return next();
    });
    agendaStub = {
      now: sinon.stub(),
    };
    mongoStub = sinon.stub();

    return Promise.resolve(SQLPool.connectSQL(config.database.sql))
      .then((pool) => {
        app = require('../../../server/index')({ values: [mongoStub, pool], agenda: agendaStub });
      });
  });

  after('Restore Dependencies', function() {
    auth.loginRequired.restore();
  });

  context('POST: /api/blacklist', function() {
    it('Add to BlackList Successfully', function(done) {
      chai.request(app)
        .post('/api/blacklist')
        .type('form')
        .send(BlackListCustomer)
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal('Success');
          done();
        });
    });

    it('Add Duplicate to BlackList', function(done) {
      chai.request(app)
        .post('/api/blacklist')
        .type('form')
        .send(BlackListCustomer)
        .end(function(err, res) {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Customer Already In BlackList');
          done();
        });
    });

    it('Add with Invalid Data Fields', function(done) {
      chai.request(app)
        .post('/api/blacklist')
        .type('form')
        .send({ exists: true })
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  context('PUT: /api/blacklist', function() {
    it('Update in BlackList Successfully', function(done) {
      chai.request(app)
        .put('/api/blacklist')
        .type('form')
        .send(BlackListCustomer)
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal('Success');
          done();
        });
    });

    it('Update in BlackList with Non-existent BookingID', function(done) {
      chai.request(app)
        .put('/api/blacklist')
        .type('form')
        .send({
          BookingID: 20,
          comments: 'Damaged Bed'
        })
        .end(function(err, res) {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Customer Does Not Exist in BlackList');
          done();
        });
    });

    it('Update In BlackList with Invalid Fields', function(done) {
      chai.request(app)
        .put('/api/blacklist')
        .type('form')
        .send({ exists: true })
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  context('DELETE: /api/blacklist', function() {
    it('Delete in BlackList with Non-existent BookingID', function(done) {
      chai.request(app)
        .delete('/api/blacklist?BookingID=20')
        .end(function(err, res) {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Customer Does Not Exist in BlackList');
          done();
        });
    });

    it('Delete in BlackList with Invalid Fields', function(done) {
      chai.request(app)
        .delete('/api/blacklist?BookingID=string')
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('Delete in BlackList Successfully', function(done) {
      chai.request(app)
        .delete('/api/blacklist?BookingID=2020112189')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal('Success');
          done();
        });
    });
  });
});

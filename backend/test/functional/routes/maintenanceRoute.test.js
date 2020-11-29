const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mongoose = require('mongoose');
const moment = require('moment');

chai.use(chaiHttp);
const { expect } = chai;

const mongoDB = require('../../../server/lib/mongo');
const config = require('../../../server/config/index')['test'];

const TestMaintenanceSchmema = require('../../../server/models/Maintenance.js');

const ReportTest = mongoose.model('MaintenanceLog', TestMaintenanceSchmema, 'MaintenanceLog');

describe('Maintenance Routes', function() {
  let auth;
  let app;
  let mongoStub;
  let sqlStub;
  let agendaStub;

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

  after('Close Mongo Connection', function(done) {
    sinon.restore();
    Promise.resolve(ReportTest.deleteMany({}))
      .then(async () => {
        await mongoose.connection.close();
        done();
      })
      .catch(err => done(err));
  });

  context('POST: /api/maintenance', function() {
    it('Fail to Create Maintenance Sheet from Undefined Name', function(done) {
      chai.request(app)
        .post('/api/maintenance')
        .type('application/json')
        .send({
          exists: true
        })
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Cannot Create Log with No Name');
          done();
        })
        .catch(err => done(err));
    });

    it('Create Maintenance Sheet (1)', function(done) {
      chai.request(app)
        .post('/api/maintenance?name=General')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body['Facilities']).to.be.an('array');
          expect(res.body['101']).to.be.an('array');
          expect(res.body['126']).to.be.an('array');
          expect(res.body.Name).to.equal('General');
          done();
        })
        .catch(err => done(err));
    });

    it('Create Maintenance Sheet (2)', function(done) {
      chai.request(app)
        .post('/api/maintenance?name=AirConditioner')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body['Facilities']).to.be.an('array');
          expect(res.body['101']).to.be.an('array');
          expect(res.body['126']).to.be.an('array');
          expect(res.body.Name).to.equal('AirConditioner');
          done();
        })
        .catch(err => done(err));
    });
  });

  context('GET: /api/maintenance', function() {
    it('Successfully Get Maintenance Sheet By Name', function(done) {
      chai.request(app)
        .get('/api/maintenance?name=General')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body['Facilities']).to.be.an('array');
          expect(res.body['101']).to.be.an('array');
          expect(res.body['126']).to.be.an('array');
          expect(res.body.Name).to.be.undefined;
          done();
        })
        .catch(err => done(err));
    });

    it('Successfully Get All Maintenance Sheet Names', function(done) {
      chai.request(app)
        .get('/api/maintenance')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(2);
          done();
        })
        .catch(err => done(err));
    });

    it('Fail to Get Maintenance Sheet w/ Nonexistent Name', function(done) {
      chai.request(app)
        .get('/api/maintenance?name=898')
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Maintenance Log Does Not Exist');
          done();
        })
        .catch(err => done(err));
    });
  });

  context('DELETE: /api/maintenance', function() {
    it('Fail to Delete Maintenance Sheet from Undefined Name', function(done) {
      chai.request(app)
        .delete('/api/maintenance')
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Cannot Delete Sheet with No Name');
          done();
        })
        .catch(err => done(err));
    });

    it('Fail to Delete Maintenance Sheet from Nonexistent Name', function(done) {
      chai.request(app)
        .delete('/api/maintenance?name=eidjiedj')
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Maintenance Log Does Not Exist');
          done();
        })
        .catch(err => done(err));
    });

    it('Successfully to Delete Maintenance Sheet', function(done) {
      chai.request(app)
        .delete('/api/maintenance?name=AirConditioner')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body['Facilities']).to.be.an('array');
          expect(res.body['101']).to.be.an('array');
          expect(res.body['126']).to.be.an('array');
          expect(res.body.Name).to.equal('AirConditioner');
          done();
        })
        .catch(err => done(err));
    });

    it('Fail to Delete Maintenance Sheet b/c Last One', function(done) {
      chai.request(app)
        .delete('/api/maintenance?name=General')
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Cannot Delete Only Maintenance Log Left');
          done();
        })
        .catch(err => done(err));
    });
  });

  context('POST: /api/maintenance/logEntry', function() {
    it('Fail to Create Maintenance LogEntry from Undefined Name', function(done) {
      chai.request(app)
        .post('/api/maintenance/logEntry?field=102')
        .type('application/json')
        .send({
          exists: true
        })
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Cannot Create Log with Undefined Name');
          done();
        })
        .catch(err => done(err));
    });

    it('Fail to Create Maintenance LogEntry from Undefined Field', function(done) {
      chai.request(app)
        .post('/api/maintenance/logEntry?name=102')
        .type('application/json')
        .send({
          exists: true
        })
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Cannot Create Log with Undefined Name');
          done();
        })
        .catch(err => done(err));
    });

    it('Fail to Create Maintenance LogEntry from Nonexistent Name', function(done) {
      chai.request(app)
        .post('/api/maintenance/logEntry?name=string&field=102')
        .type('application/json')
        .send({
          completed: true,
          date: new Date(),
          description: '',
          cost: 90,
        })
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Failed to Find Matching Maintenance Sheet');
          done();
        })
        .catch(err => done(err));
    });

    it('Fail to Create Maintenance LogEntry with Invalid Fields', function(done) {
      chai.request(app)
        .post('/api/maintenance/logEntry?name=General&field=101')
        .type('application/json')
        .send({
          completed: 'string',
          date: 'string',
          description: '',
          cost: 90,
        })
        .then((res) => {
          expect(res).to.have.status(400);
          done();
        })
        .catch(err => done(err));
    });

    it('Successfully Create Maintenance LogEntry', function(done) {
      chai.request(app)
        .post('/api/maintenance/logEntry?name=General&field=101')
        .type('application/json')
        .send({
          completed: false,
          date: '2020-11-01T04:54:24.574Z',
          description: 'Fix Tiolet',
          cost: 90,
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body['101'].length).to.equal(1);
          expect(res.body['101'][0]).to.include({
            completed: false,
            date: '2020-11-01T04:54:24.574Z',
            description: 'Fix Tiolet',
            cost: 90,
          });
          done();
        })
        .catch(err => done(err));
    });
  });

  context('PUT: /api/maintenance/logEntry', function() {
    it('Fail to Create Maintenance LogEntry from Undefined Name', function(done) {
      chai.request(app)
        .put('/api/maintenance/logEntry?field=102')
        .type('application/json')
        .send({
          exists: true
        })
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Cannot Update Log with Undefined Name');
          done();
        })
        .catch(err => done(err));
    });

    it('Fail to Create Maintenance LogEntry from Undefined Field', function(done) {
      chai.request(app)
        .put('/api/maintenance/logEntry?name=102')
        .type('application/json')
        .send({
          exists: true
        })
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Cannot Update Log with Undefined Name');
          done();
        })
        .catch(err => done(err));
    });

    // @TODO: Test Cases for Update Maintenance Log Entries.
    // Will Need to Generate Own ID for Log Entries
  });

  context('DELETE: /api/maintenance/logEntry', function() {
    it('Fail to Delete Maintenance LogEntry from Undefined Name', function(done) {
      chai.request(app)
        .delete('/api/maintenance/logEntry?field=102')
        .type('application/json')
        .send({
          exists: true
        })
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Cannot Delete Log with Undefined Name');
          done();
        })
        .catch(err => done(err));
    });

    it('Fail to Delete Maintenance LogEntry from Undefined Field', function(done) {
      chai.request(app)
        .delete('/api/maintenance/logEntry?name=102')
        .type('application/json')
        .send({
          exists: true
        })
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Cannot Delete Log with Undefined Name');
          done();
        })
        .catch(err => done(err));
    });


    // @TODO: Test Cases for Delete Maintenance Log Entries.
    // Will Need to Generate Own ID for Log Entries
  });
});

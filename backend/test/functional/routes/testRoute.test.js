// const chai = require('chai');
// const proxyquire = require('proxyquire');
// const chaiHttp = require('chai-http');
// const sinon = require('sinon');
// const logger = require('morgan');
// const decache = require('decache');

// chai.use(chaiHttp);
// const { expect } = chai;

// describe('Without Auth', function() {
//   let app;
//   let agendaStub;
//   let mongoStub;

//   beforeEach(function() {
//     decache('../../../server/index');

//     agendaStub = sinon.stub();

//     mongoStub = sinon.stub();

//     sqlStub = sinon.stub();

//     app = require('../../../server/index')({ values: [mongoStub, sqlStub], agenda: agendaStub });
//   });

//   // afterEach(function() {
//   //   sandbox.restore();
//   // });

//   it('Test Authentication Route(1)', function(done) {
//     chai.request(app)
//       .get('/api/search/reservations/firstName?firstName=Henry')
//       .end(function(err, res) {
//         expect(res).to.have.status(401);

//         done();
//       });
//   });
// });

// describe('With Auth', function() {
//   let app;
//   let mongoStub;
//   let sqlStub;
//   let agendaStub;
//   let auth;

//   beforeEach(function() {
//     decache('../../../server/index');

//     auth = require('../../../server/services/Staff');
//     let authStub = sinon.stub(auth, 'loginRequired').callsFake(function(req, res, next) {
//       return next();
//     });

//     let morganStub = function(req, res, next) {
//       next();
//     };

//     agendaStub = sinon.stub();

//     mongoStub = sinon.stub();

//     sqlStub = sinon.stub();

//     app = require('../../../server/index')({ values: [mongoStub, sqlStub], agenda: agendaStub });
//     // app = proxyquire('../../../server/index', {
//     //   './services/Staff': authStub,
//     //   'morgan': morganStub
//     // })({ values: [mongoStub, sqlStub], agenda: agendaStub });
//   });

//   afterEach(function() {
//     sinon.restore();
//   });

//   it('Test Authentication Route(2)', function(done) {
//     chai.request(app)
//       .get('/api/search/resery')
//       .end(function(err, res) {
//         expect(res).to.have.status(404);

//         done();
//       });
//   });
// });

// describe('Without Auth (2)', function() {
//   let app;
//   let agendaStub;
//   let mongoStub;

//   beforeEach(function() {
//     decache('../../../server/index');
//     agendaStub = sinon.stub();

//     mongoStub = sinon.stub();

//     sqlStub = sinon.stub();

//     app = require('../../../server/index')({ values: [mongoStub, sqlStub], agenda: agendaStub });
//   });

//   // afterEach(function() {
//   //   sandbox.restore();
//   // });

//   it('Test Authentication Route(1)', function(done) {
//     chai.request(app)
//       .get('/api/search/reservat')
//       .end(function(err, res) {
//         expect(res).to.have.status(401);

//         done();
//       });
//   });
// });

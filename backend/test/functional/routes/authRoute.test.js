const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const decache = require('decache');
const mongoose = require('mongoose');

chai.use(chaiHttp);
const { expect } = chai;

const mongoDB = require('../../../server/lib/mongo');
const config = require('../../../server/config/index')['test'];

const StaffSchema = require('../../../server/models/Staff');
const StaffTestModel = mongoose.model(
  'Staff',
  StaffSchema,
  'Staff'
);

describe('Authentication Routes', function() {
  let app;
  let mongoStub;
  let sqlStub;
  let agendaStub;

  before('Establish Mongo Connection', function() {
    agendaStub = sinon.stub();

    mongoStub = sinon.stub();

    sqlStub = sinon.stub();

    app = require('../../../server/index')({ values: [mongoStub, sqlStub], agenda: agendaStub });
    return mongoDB.connectMongo(config.database.mongo);
  });

  after('Close Mongo Connection', function() {
    return mongoose.connection.close();
  });

  it('Test Authentication Route(1)', function(done) {
    chai.request(app)
      .get('/api/search/reservations/firstName?firstName=Henry')
      .end(function(err, res) {
        expect(res).to.have.status(401);

        done();
      });
  });

  it('Test Authentication Route(2)', function(done) {
    chai.request(app)
      .get('/api/customers/eded')
      .end(function(err, res) {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe.only('Staff and Login Routes', function() {
  const user = [
    {
      username: 'ivan',
      hashPassword: '$2b$10$LH3jmEAVCED5ZJPRv.cSTOsQ1bIAD2tJOtefjVHWj9pE6ev0WXYsC', //test123
      email: 'izou3@gatech.edu',
      firstName: 'Ided',
      lastName: 'deded',
      position: 0,
      HotelID: 58566,
    },
    {
      username: 'iv',
      hashPassword: '$2b$10$LH3jmEAVCED5ZJPRv.cSTOsQ1bIAD2tJOtefjVHWj9pE6ev0WXYsC', //test123
      email: 'izou3@',
      firstName: 'Ivan',
      lastName: 'Zou',
      position: 1,
      HotelID: 58566,
    }
  ];

  before('Establish Mongo Connection', function() {
    return mongoDB.connectMongo(config.database.mongo);
  });

  after('Close Mongo Connection', function() {
    return mongoose.connection.close();
  });

  context('Login/Logout Routes', function() {
    let app;
    let mongoStub;
    let sqlStub;
    let agendaStub;

    before('Insert Staff Members into Collection', function() {
      agendaStub = {
        now: sinon.stub(),
      };
      mongoStub = sinon.stub();

      sqlStub = sinon.stub();

      app = require('../../../server/index')({ values: [mongoStub, sqlStub], agenda: agendaStub });

      const promise1 = StaffTestModel.insertMany(user);
      return Promise.all([promise1]);
    });

    after('Delete All Staff Members from Collection', function() {
      sinon.restore();
      const promise1 = StaffTestModel.deleteMany({});
      return Promise.all([promise1]);
    });

    it('Should Login Correctly with Valid Username and Password', function(done) {
      let agent = chai.request.agent(app);
      agent
        .post('/user/login?HotelID=58566')
        .type('form')
        .send({
          username: 'ivan',
          password: 'test1234'
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.have.cookie('token');

          return agent.get('/api?HotelID=90')
            .then(function(res) {
              expect(res).to.have.status(404);
              done();
            });
        })
        .catch(function(err) {
          done(err);
        });
    });

    it('Should Fail to Login with Invalid Username', function(done) {
      let agent = chai.request.agent(app);
      agent
        .post('/user/login?HotelID=58566')
        .type('form')
        .send({
          username: 'iva',
          password: 'test1234'
        })
        .then(function (res) {
          expect(res).to.not.have.cookie('token');
          expect(res.body.message).to.equal('Authentication Failed! No Staff Found');

          return agent.get('/api')
            .then(function(res) {
              expect(res).to.have.status(401);
              done();
            });
        })
        .catch(function(err) {
          done(err);
        });
    });

    it('Should Fail to Login with Invalid Password', function(done) {
      let agent = chai.request.agent(app);
      agent
        .post('/user/login?HotelID=58566')
        .type('form')
        .send({
          username: 'ivan',
          password: 'open'
        })
        .then(function (res) {
          expect(res).to.not.have.cookie('token');
          expect(res.body.message).to.equal('Authentication Failed! Wrong Password');

          return agent.get('/api')
            .then(function(res) {
              expect(res).to.have.status(401);
              done();
            });
        })
        .catch(function(err) {
          done(err);
        });
    });

    it('Should logout User by Removing Cookie', function(done) {
      let agent = chai.request.agent(app);
      agent
        .get('/user/logout')
        .then(function (res) {
          expect(res).to.not.have.cookie('token');
          expect(res.body.message).to.equal('Successfully Logged Out');

          return agent.get('/api')
            .then(function(res) {
              expect(res).to.have.status(401);
              done();
            });
        })
        .catch(function(err) {
          done(err);
        });
    });
  });

});

describe('Staff Routes', function() {
  const user = [
    {
      username: 'ivan',
      hashPassword: '$2b$10$LH3jmEAVCED5ZJPRv.cSTOsQ1bIAD2tJOtefjVHWj9pE6ev0WXYsC', //test123
      email: 'izou3@gatech.edu',
      firstName: 'Ided',
      lastName: 'deded',
      position: 0
    },
    {
      username: 'iv',
      hashPassword: '$2b$10$LH3jmEAVCED5ZJPRv.cSTOsQ1bIAD2tJOtefjVHWj9pE6ev0WXYsC', //test123
      email: 'izou3@',
      firstName: 'Ivan',
      lastName: 'Zou',
      position: 1
    }
  ];

  before('Establish Mongo Connection', function() {
    decache('../../../server/index');
    return mongoDB.connectMongo(config.database.mongo);
  });

  after('Close Mongo Connection', function() {
    return mongoose.connection.close();
  });

  context('Staff Routes', function() {
    let auth;
    let app;
    let mongoStub;
    let sqlStub;
    let agendaStub;

    before('Insert Staff Members into Collection', function() {
      auth = require('../../../server/services/Staff');
      sinon.stub(auth, 'loginRequired').callsFake(function(req, res, next) {
        return next();
      });

      agendaStub = sinon.stub();

      mongoStub = sinon.stub();

      sqlStub = sinon.stub();

      app = require('../../../server/index')({ values: [mongoStub, sqlStub], agenda: agendaStub });

      const promise1 = StaffTestModel.insertMany(user);
      return Promise.all([promise1]);
    });

    after('Delete All Staff Members from Collection', function() {
      auth.loginRequired.restore();
      const promise1 = StaffTestModel.deleteMany({});
      return Promise.all([promise1]);
    });

    describe('Get All Staff', function() {
      it('Return All Staff', function() {
        chai.request(app)
          .get('/user')
          .end(function(err, res) {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(2);
            expect(res.body[0]).to.have.keys('username', 'email', 'position', 'firstName', 'lastName');
          });
      });
    });

    describe('Create New Staff', function() {
      it('Create New Staff Successfully', function(done) {
        chai.request(app)
          .post('/user')
          .type('form')
          .send({
            username: 'James',
            password: 'test12345',
            email: 'kdeid',
            firstName: 'Jame',
            lastName: 'Zou',
            position: 2
          })
          .then(function (res1) {
            expect(res1).to.have.status(200);
            expect(res1.body).to.be.an('Object');
            done();
            return chai.request(app)
              .get('/user/logout')
              .type('form')
              .then(function(res2) {
                expect(res2).to.have.status(200);
                return chai.request(app)
                  .post('/user/login')
                  .type('form')
                  .send({
                    username: 'James',
                    password: 'test12345',
                  })
                  .then(function(res3) {
                    expect(res3).to.have.status(200);
                    expect(res3).to.have.cookie('token');
                    done();
                  });
              });
          })
          .catch(err => done(err));
      });

      it('Create Staff with Duplicate Username', function(done) {
        chai.request(app)
          .post('/user')
          .type('form')
          .send({
            username: 'ivan',
            password: 'test',
            email: 'kdeid',
            firstName: 'Jame',
            lastName: 'Zou',
            position: 2
          })
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Cannot Create new Staff with Existing Email or Username');
            done();
          });
      });

      it('Create Staff with Duplicate Email', function(done) {
        chai.request(app)
          .post('/user')
          .type('form')
          .send({
            username: 'Really',
            password: 'test',
            email: 'izou3@gatech.edu',
            firstName: 'Jame',
            lastName: 'Zou',
            position: 2
          })
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Cannot Create new Staff with Existing Email or Username');
            done();
          });
      });

      it('Create Staff with Insufficent Data', function(done) {
        chai.request(app)
          .post('/user')
          .type('form')
          .send({
            username: 'Really',
            password: 'test',
            email: 'izou3@gatech.edu',
            position: 2
          })
          .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
          });
      });
    });

    describe('Update Staff', function() {
      it('Update Staff Successfully', function(done) {
        chai.request(app)
          .put('/user')
          .type('form')
          .send({
            username: 'ivan',
            firstName: 'Ivan',
            position: 1
          })
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.include({
              username: 'ivan',
              email: 'izou3@gatech.edu',
              firstName: 'Ivan',
              lastName: 'deded',
              position: 1
            });
            done();
          });
      });

      it('Update Staff with Password Field', function(done) {
        chai.request(app)
          .put('/user')
          .type('form')
          .send({
            username: 'ivan',
            password: 'newPassword',
            firstName: 'Ivan',
            position: 1
          })
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Cannot Change Password! Please reset it!');
            done();
          });
      });

      it('Update Staff with Non-existent Username', function(done) {
        chai.request(app)
          .put('/user')
          .type('form')
          .send({
            username: 'ivaneded',
            firstName: 'Ivan',
            position: 1
          })
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('No Staff with Username Found');
            done();
          });
        });
    });

    describe('Delete Staff', function() {
      it('Delete Staff Successfully', function(done) {
        chai.request(app)
          .delete('/user?username=ivan')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            expect(res.body.message).to.equal('Successfully Deleted');
            done();
          });
      });

      it('Delete Staff with Non-existent Username', function(done) {
        chai.request(app)
          .delete('/user?username=string')
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Username Does Not Exist');
            done();
        });
      });
    });
  });
});

const chai = require('chai');
const mongoose = require('mongoose');
const moment = require('moment');

const { expect } = chai;
const mongoDB = require('../../server/lib/mongo');
const config = require('../../server/config/index')['test'];

const StaffTestSch = require('../../server/models/Staff');
const StaffTestModel = mongoose.model(
  'Staff',
  StaffTestSch,
  'Staff'
);

const { register, getAllStaff, updateStaff, deleteStaff } = require('../../server/services/Staff');

describe('CRUD on Staff Collection', function() {

  // Open and Close Mongo Connections
  before('Establish Mongo Connection', function() {
    return mongoDB.connectMongo(config.database.mongo);
  });

  after('Close Mongo Connection', function() {
    return mongoose.connection.close();
  });

  context('Add New Staff', function() {
    afterEach('Clear All Users in Collection', async function() {
      return StaffTestModel.deleteMany({}).exec();
    });

    it('Successfully Create New Staff', async function() {
      const newStaff = {
        username: 'ivan',
        password: 'Air',
        email: 'izou3@',
        firstName: 'Ivan',
        lastName: 'Zou',
        position: 0
      };

      return register(newStaff)
        .then((res) => {
          expect(newStaff.username).to.equal(res.username);

          return getAllStaff()
            .then((res) => {
              expect(res).to.be.an('array');
              expect(res.length).to.equal(1);
              expect(res[0].username).to.include(newStaff.username);
            });
        });
    });

    it('Create Staff with Duplicate Username', async function() {
      const newStaff1 = {
        username: 'ivan',
        password: 'Air',
        email: 'izou3@',
        firstName: 'Ivan',
        lastName: 'Zou',
        position: 0
      };

      const newStaff2 = {
        username: 'ivan',
        password: 'deded',
        email: 'izede',
        firstName: 'Ided',
        lastName: 'deded',
        position: 0
      };

      await register(newStaff1);

      register(newStaff2).catch(err =>
        expect(err.message).to.equal('Cannot Create new Staff with Existing Email or Username')
      );

      return getAllStaff()
        .then((res) => {
          expect(res).to.be.an('array');
          expect(res.length).to.equal(1);
        });
    });

    it('Create Staff with Duplicate Email', async function() {
      const newStaff1 = {
        username: 'iv',
        password: 'Air',
        email: 'izou3@',
        firstName: 'Ivan',
        lastName: 'Zou',
        position: 0
      };

      const newStaff2 = {
        username: 'ivan',
        password: 'deded',
        email: 'izou3@',
        firstName: 'Ided',
        lastName: 'deded',
        position: 0
      };

      await register(newStaff1);

      register(newStaff2).catch(err =>
        expect(err.message).to.equal('Cannot Create new Staff with Existing Email or Username')
      );

      return getAllStaff()
        .then((res) => {
          expect(res).to.be.an('array');
          expect(res.length).to.equal(1);
        });
    });

    it('Create Staff with Insufficent Data', function() {
      const newStaff = {
        username: 'ivan',
        firstName: 'Ivan',
        lastName: 'Zou',
        position: 0
      };

      return register(newStaff)
        .catch(err => {
          expect(err).to.be.an('error');
        });
    });
  });

  context('Update Staff', function() {
    const updatedStaff = {
      username: 'ivan',
      hashPassword: 'hekeo',
      email: 'izou3@gatech.edu',
      firstName: 'Ivan',
      lastName: 'Zou',
      position: 0
    };

    beforeEach('Add Staff', function() {
      return StaffTestModel.insertMany([updatedStaff]);
    });

    afterEach('Delete All Staff', function() {
      return StaffTestModel.deleteMany({}).exec();
    });

    it('Update Staff', async function() {
      const updateObj = {
        username: 'ivan',
        position: 2,
      };

      return updateStaff(updateObj)
        .then((res) => {
          expect(res).include(updateObj);
          return getAllStaff()
            .then((res) => {
              expect(res).to.be.an('array');
              expect(res.length).to.equal(1);
              expect(res[0]).to.include(updateObj);
            });
        });
    });

    it('Update Staff with Password field', async function() {
      updateStaff(updatedStaff)
        .catch((err) => {
          expect(err.message).to.equal('Cannot Change Password! Please reset it!');
        });

      return getAllStaff()
      .then((res) => {
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);
      });
    });

    it('Update Staff with Non-existent Username', function() {
      updateStaff({
        ...updatedStaff,
        username: 'james'
      })
      .then((res) => {
        expect(res).to.be.null;
      });

      return getAllStaff()
      .then((res) => {
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);
      });
    });
  });

  context('Delete Staff', function() {
    const updatedStaff = {
      username: 'ivan',
      hashPassword: 'hekeo',
      email: 'izou3@gatech.edu',
      firstName: 'Ivan',
      lastName: 'Zou',
      position: 0
    };

    beforeEach('Add Staff', function() {
      return StaffTestModel.insertMany([updatedStaff]);
    });

    afterEach('Delete All Staff', function() {
      return StaffTestModel.deleteMany({}).exec();
    });

    it('Successfully Delete Staff', function() {
      return deleteStaff('ivan')
        .then((res) => {
          expect(res.username).to.equal('ivan');

          return getAllStaff()
            .then((res) => {
              expect(res).to.be.an('array');
              expect(res.length).to.equal(0);
            });
        });
    });

    it('Delete with Non-existent Username', function() {
      deleteStaff('ivede')
        .then((res) => {
          expect(res).to.be.null;
        });

      return getAllStaff()
        .then((res) => {
          expect(res).to.be.an('array');
          expect(res.length).to.equal(1);
          expect(res[0].username).to.equal('ivan');
        });
    });
  });
});

const chai = require('chai');

const { expect } = chai;
const config = require('../../../server/config/index')['test'];
const SQLPool = require('../../../server/lib/sql');
const CustomerTestClass = require('../../../server/services/customers/Customer');

describe('Customer Service Class', async function() {
  const pool = await SQLPool.connectSQL(config.database.sql);
  const Customer = new CustomerTestClass(pool);

  context('Method addNewCustomer()', function() {
    afterEach('Clear Database', async function() {
      pool.query('TRUNCATE TABLE customer');
      pool.query('TRUNCATE TABLE indcustomer');
    });
  });
});

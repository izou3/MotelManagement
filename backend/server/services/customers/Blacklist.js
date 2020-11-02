/**
 * Moduel Dependencies
 */
const mysql = require('mysql2/promise');

/**
 * Blacklist Controller Class to hold customers on the blacklist
 */
class Blacklist {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Search Blacklist by ID
   * @param {Integer} id BookingID of Customer
   * @return The Resulting BlackList Customer Record
   */
  getBlacklistCustomerByID(id) {
    const sql =
      'SELECT IndCustomer.BookingID, Customer.first_name AS firstName, Customer.last_name AS lastName, BlackList.comments FROM BlackList JOIN IndCustomer ON IndCustomer.BookingID = BlackList.BookingID JOIN Customer ON IndCustomer.customerid = Customer.id WHERE indcustomer.BookingID=?;';

    return this.queryDB(sql, [id])
      .then((res) => {
        if (res[0].length === 0) {
          throw new Error('Failed to Find Match');
        }
        return res[0];
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  }

  /**
   * Search for Blacklist customer by Name
   * @param {String} first first name of customer
   * @param {String} last last name of customer
   * @return The Resulting BlackList Customer Record
   */
  getBlacklistCustomerByName(last) {
    const sql =
      'SELECT IndCustomer.BookingID, Customer.first_name AS firstName, Customer.last_name AS lastName, BlackList.comments FROM BlackList JOIN IndCustomer ON IndCustomer.BookingID = BlackList.BookingID JOIN Customer ON IndCustomer.customerid = Customer.id WHERE customer.first_name=?;';

    return this.queryDB(sql, [last])
      .then((res) => {
        if (res.length === 0) {
          throw new Error('Failed to Find Match');
        }
        return res[0];
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  }

  /**
   * Add a customer to the blacklist
   * @param {Object} newCust new customer object
   * @return The Newly Added Customer
   */
  addBlacklistCustomer(newCust) {
    const sql = 'INSERT INTO BlackList(BookingID, comments) VALUES(?,?);';

    return this.queryDB(sql, [newCust.BookingID, newCust.comments])
      .then((res) => {
        if (res[0].length === 0) {
          throw new Error();
        }
        return res[0];
      })
      .catch(() => {
        throw Error('Customer ALready in BlackList');
      });
  }

  /**
   * Update Blacklist Customer
   * @param {Object} updatedCustomer customer object
   */
  updateBlacklistCustomer(updatedCustomer) {
    const sql = 'UPDATE BlackList SET comments=? WHERE BookingID=?';

    return this.queryDB(sql, [
      updatedCustomer.comments,
      updatedCustomer.BookingID,
    ])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }

  /**
   * Delete a Blacklist customer
   * @param {Integer} ID ID of blacklist customer
   */
  deleteBlacklistCustomerByID(ID) {
    const sql = 'DELETE FROM BlackList WHERE BookingID = ?';

    return this.queryDB(sql, [ID])
      .then((res) => res)
      .catch((err) => Promise.reject(err));
  }

  /**
   * Helper Function To Execute Queries Against MySQL
   * @param {String} sql SQL query
   * @param {array} arr  Array with data fields
   */
  async queryDB(sql, arr = []) {
    const sqlQuery = mysql.format(sql, arr);
    return this.pool.query(sqlQuery);
  }
}

module.exports = Blacklist;

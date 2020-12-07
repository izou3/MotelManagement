const mysql = require('mysql2/promise');
const Customers = require('./index');

class BlackList extends Customers {
  // Inherits the Customer Constructor

  /**
   * Search Blacklist by ID
   * @param {Integer} BookingID BookingID of Customer
   * @return SQL Query of matching BlackList Customer Object
   */
  getBlacklistCustomerByBookingID(BookingID) {
    const sql = `SELECT ${this._IndCustomer}.BookingID, ${this._Customer}.first_name AS firstName, ${this._Customer}.last_name AS lastName, ${this._BlackList}.comments FROM ${this._BlackList} JOIN ${this._IndCustomer} ON ${this._IndCustomer}.BookingID = ${this._BlackList}.BookingID JOIN ${this._Customer} ON ${this._IndCustomer}.CustomerID = ${this._Customer}.id WHERE ${this._IndCustomer}.BookingID=?;`;
    return mysql.format(sql, [BookingID]);
  }

  /**
   * Search for Blacklist customer by Name
   * @param {String} firstName first name of customer
   * @return SQL Query of matching BlackList Customer Object
   */
  getBlacklistCustomerByFirstName(firstName) {
    const sql = `SELECT ${this._IndCustomer}.BookingID, ${this._Customer}.first_name AS firstName, ${this._Customer}.last_name AS lastName, ${this._BlackList}.comments FROM ${this._BlackList} JOIN ${this._IndCustomer} ON ${this._IndCustomer}.BookingID = ${this._BlackList}.BookingID JOIN ${this._Customer} ON ${this._IndCustomer}.CustomerID = ${this._Customer}.id WHERE ${this._Customer}.first_name=?;`;

    return mysql.format(sql, [firstName]);
  }

  /**
   * Add a customer to the blacklist
   * @param {Number} BookingID
   * @param {String} Comments
   * @return The Newly Added Black List Customer
   */
  addBlacklistCustomer(BookingID, Comments) {
    const sql = `INSERT INTO ${this._BlackList}(BookingID, comments) VALUES(?,?);`;
    return mysql.format(sql, [BookingID, Comments]);
  }

  /**
   * Update Blacklist Customer
   * @param {String} Comments
   * @return Updated BlackList Customer Object
   */
  updateBlacklistCustomer(BookingID, Comments) {
    const sql = `UPDATE ${this._BlackList} SET comments=? WHERE BookingID=?`;
    return mysql.format(sql, [Comments, BookingID]);
  }

  /**
   * Delete BlackList Customer
   * @param {Number} BookingID
   * @return The deleted BlackList Customer Object
   */
  deleteBlacklistCustomerByID(BookingID) {
    const sql = `DELETE FROM ${this._BlackList} WHERE BookingID = ?`;
    return mysql.format(sql, [BookingID]);
  }
}

module.exports = BlackList;

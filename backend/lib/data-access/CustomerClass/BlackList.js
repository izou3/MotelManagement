const mysql = require('mysql2/promise');
const Customers = require('./index');

class BlackList extends Customers {
  // Inherits the Customer Constructor
  /**
   * Search for Blacklist customer by First Name
   * @param {String} firstName first name of customer
   * @return SQL Query of matching BlackList Customer Object
   */
  getBlacklistCustomerByFirstName(firstName) {
    const sql = `SELECT ${this._Customer}.ID AS CustomerID, ${this._Customer}.first_name AS firstName, ${this._Customer}.last_name AS lastName, ${this._BlackList}.comments FROM ${this._BlackList} JOIN ${this._Customer} ON ${this._Customer}.ID = ${this._BlackList}.CustomerID WHERE ${this._Customer}.first_name=?;`;

    return mysql.format(sql, [firstName]);
  }

  /**
   * Search for Blacklist customer by Last Name
   * @param {String} firstName first name of customer
   * @return SQL Query of matching BlackList Customer Object
   */
  getBlacklistCustomerByLastName(lastName) {
    const sql = `SELECT ${this._Customer}.ID AS CustomerID, ${this._Customer}.first_name AS firstName, ${this._Customer}.last_name AS lastName, ${this._BlackList}.comments FROM ${this._BlackList} JOIN ${this._Customer} ON ${this._Customer}.ID = ${this._BlackList}.CustomerID WHERE ${this._Customer}.last_name=?;`;

    return mysql.format(sql, [lastName]);
  }

  /**
   * Add a customer to the blacklist
   * @param {String} CustomerID
   * @param {String} Comments
   * @return The Newly Added Black List Customer
   */
  addBlacklistCustomer(CustomerID, Comments) {
    const sql = `INSERT INTO ${this._BlackList}(CustomerID, comments) VALUES(?,?);`;
    return mysql.format(sql, [CustomerID, Comments]);
  }

  /**
   * Update Blacklist Customer
   * @param {String} CustomerID
   * @param {String} Comments
   * @return Updated BlackList Customer Object
   */
  updateBlacklistCustomer(CustomerID, Comments) {
    const sql = `UPDATE ${this._BlackList} SET comments=? WHERE CustomerID=?`;
    return mysql.format(sql, [Comments, CustomerID]);
  }

  /**
   * Delete BlackList Customer
   * @param {String} CustomerID
   * @param {Number} BookingID
   * @return The deleted BlackList Customer Object
   */
  deleteBlacklistCustomerByID(CustomerID) {
    const sql = `DELETE FROM ${this._BlackList} WHERE CustomerID = ?`;
    return mysql.format(sql, [CustomerID]);
  }
}

module.exports = BlackList;

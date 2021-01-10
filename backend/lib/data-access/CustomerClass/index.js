const mysql = require('mysql2/promise');
const Motel = require('../Motel');

class Customers extends Motel {
  /**
   * @param {Number} HotelID
   * @returns New instance of Customer referencing MYSQL
   */
  constructor(HotelID) {
    super(HotelID);
    this._HotelID = HotelID;
    this._BlackList = 'BlackList';
    this._IndCustomer = 'IndCustomer';
    this._Customer = 'Customer';
    this._Motel = 'Motels';
    this._MotelRoomList = 'MotelRooms';
  }

  /**
   * Returns Array of Specified Motel Entries
   */
  getMotelInfo() {
    const sql = `SELECT * FROM ${this._Motel} WHERE ID = ?`;
    return mysql.format(sql, [this._HotelID]);
  }

  /**
   * Returns Array of Specified Motel Room Number Lists
   */
  getMotelRoomList(abbrev) {
    const sql = `SELECT ${abbrev} FROM ${this._MotelRoomList};`;
    return mysql.format(sql, [abbrev]);
  }

  /**
   * Returns Array of all customer Objects
   */
  getAllCustomers() {
    const sql = `SELECT * FROM ${this._IndCustomer}`;
    return mysql.format(sql, []);
  }

  /**
   * @param {Number} BookingID
   * @returns Formatted SQL Query returning Array of Matching Objects
   */
  getIndCustomerByID(BookingID) {
    let sql = `SELECT ${this._IndCustomer}.BookingID, ${this._Customer}.ID AS CustomerID, ${this._Customer}.first_name AS firstName, ${this._Customer}.last_name AS lastName, `;

    sql = sql.concat(
      `${this._Customer}.email AS email, ${this._Customer}.phone AS phone, ${this._Customer}.state AS StateID, `
    );

    sql = sql.concat(
      `${this._IndCustomer}.price_paid AS pricePaid, ${this._IndCustomer}.tax, ${this._IndCustomer}.check_in AS checkIn, ${this._IndCustomer}.check_out AS checkOut, ${this._IndCustomer}.Num_Guests AS numGuests, `
    );

    sql = sql.concat(
      `${this._IndCustomer}.roomid AS RoomID, ${this._IndCustomer}.reservationid AS ReservationID, ${this._IndCustomer}.paymentid AS PaymentID,
      ${this._IndCustomer}.HotelID AS HotelID, ${this._IndCustomer}.StyleID AS StyleID, ${this._IndCustomer}.comments AS comments `
    );

    sql = sql.concat(
      `FROM ${this._Customer} INNER JOIN ${this._IndCustomer} ON ${this._IndCustomer}.CustomerID=${this._Customer}.ID WHERE ${this._IndCustomer}.BookingID = ? AND ${this._IndCustomer}.HotelID = ${this._HotelID};`
    );

    return mysql.format(sql, [BookingID]);
  }

  /**
   * @param {String} firstName
   * @returns Formatted SQL Query returning Array of Matching Objects
   */
  getIndCustomerByFirstName(firstName) {
    let sql = `SELECT ${this._IndCustomer}.BookingID, ${this._Customer}.ID AS CustomerID, ${this._Customer}.first_name AS firstName, ${this._Customer}.last_name AS lastName, `;

    sql = sql.concat(
      `${this._Customer}.email AS email, ${this._Customer}.phone AS phone, ${this._Customer}.state AS StateID, `
    );

    sql = sql.concat(
      `${this._IndCustomer}.price_paid AS pricePaid, ${this._IndCustomer}.tax, ${this._IndCustomer}.check_in AS checkIn, ${this._IndCustomer}.check_out AS checkOut, ${this._IndCustomer}.Num_Guests AS numGuests, `
    );

    sql = sql.concat(
      `${this._IndCustomer}.roomid AS RoomID, ${this._IndCustomer}.reservationid AS ReservationID, ${this._IndCustomer}.paymentid AS PaymentID,
      ${this._IndCustomer}.HotelID AS HotelID, ${this._IndCustomer}.StyleID AS StyleID, ${this._IndCustomer}.comments AS comments `
    );

    sql = sql.concat(
      `FROM ${this._Customer} INNER JOIN ${this._IndCustomer} ON ${this._IndCustomer}.CustomerID=${this._Customer}.ID WHERE ${this._Customer}.first_name = ? AND ${this._IndCustomer}.HotelID = ${this._HotelID};`
    );

    return mysql.format(sql, [firstName]);
  }

  /**
   * @param {Date} start
   * @param {Date} end
   * @returns Formatted SQL Query returning Array of Matching Objects
   */
  getIndCustomerByCheckIn(start, end) {
    let sql = `SELECT ${this._IndCustomer}.BookingID, ${this._Customer}.ID AS CustomerID, ${this._Customer}.first_name AS firstName, ${this._Customer}.last_name AS lastName, ${this._Customer}.email AS email, ${this._Customer}.phone AS phone, ${this._Customer}.state AS StateID, `;

    sql = sql.concat(
      `${this._IndCustomer}.price_paid AS pricePaid, ${this._IndCustomer}.tax, ${this._IndCustomer}.check_in AS checkIn, ${this._IndCustomer}.check_out AS checkOut, ${this._IndCustomer}.Num_Guests AS numGuests, `
    );

    sql = sql.concat(
      `${this._IndCustomer}.roomid AS RoomID, ${this._IndCustomer}.reservationid AS ReservationID, ${this._IndCustomer}.paymentid AS PaymentID,
      ${this._IndCustomer}.HotelID AS HotelID, ${this._IndCustomer}.StyleID AS StyleID, ${this._IndCustomer}.comments AS comments `
    );

    sql = sql.concat(
      `FROM ${this._Customer} INNER JOIN ${this._IndCustomer} ON ${this._IndCustomer}.CustomerID=${this._Customer}.ID WHERE
      ${this._IndCustomer}.HotelID = ${this._HotelID} AND ${this._IndCustomer}.check_in BETWEEN ? AND ?;`
    );

    return mysql.format(sql, [start, end]);
  }

  /**
   * @param {Date} start
   * @param {Date} end
   * @returns Formatted SQL Query returning Array of Matching Objects
   */
  getIndCustomerByCheckOut(start, end) {
    let sql = `SELECT ${this._IndCustomer}.BookingID, ${this._Customer}.ID AS CustomerID, ${this._Customer}.first_name AS firstName, ${this._Customer}.last_name AS lastName, ${this._Customer}.email AS email, ${this._Customer}.phone AS phone, ${this._Customer}.state AS StateID, `;

    sql = sql.concat(
      `${this._IndCustomer}.price_paid AS pricePaid, ${this._IndCustomer}.tax, ${this._IndCustomer}.check_in AS checkIn, ${this._IndCustomer}.check_out AS checkOut, ${this._IndCustomer}.Num_Guests AS numGuests, `
    );

    sql = sql.concat(
      `${this._IndCustomer}.roomid AS RoomID, ${this._IndCustomer}.reservationid AS ReservationID, ${this._IndCustomer}.paymentid AS PaymentID,
      ${this._IndCustomer}.HotelID AS HotelID, ${this._IndCustomer}.StyleID AS StyleID, ${this._IndCustomer}.comments AS comments `
    );

    sql = sql.concat(
      `FROM ${this._Customer} INNER JOIN ${this._IndCustomer} ON ${this._IndCustomer}.CustomerID=${this._Customer}.ID WHERE
      ${this._IndCustomer}.HotelID = ${this._HotelID} AND ${this._IndCustomer}.check_out BETWEEN ? AND ?;`
    );

    return mysql.format(sql, [start, end]);
  }

  /**
   * @param {String} firstName
   * @param {String} lastName
   *
   * @returns A SQL Query for an array of matching Customer Objects
   */
  getAllCustomersByFirstLastName(firstName, lastName) {
    const sql = `SELECT * FROM ${this._Customer} WHERE last_name=? AND first_name=?;`;
    return mysql.format(sql, [lastName, firstName]);
  }

  /**
   * @param {[
   *  ID, YearID, MonthID, first_name, last_name, email, phone, state
   * ]} CustomerData
   *
   * @returns A SQL Query for an array of the newly added Customer Obj
   */
  addNewCustomer(CustomerData = []) {
    const sql = `INSERT INTO ${this._Customer}(ID,YearID,MonthID,first_name,last_name,email,phone,state) VALUES(?,?,?,?,?,?,?,?);`;
    return mysql.format(sql, CustomerData);
  }

  /**
   * @param {[
   *  BookingID, CustomerID, price_paid, tax, check_in check_out, num_guests, reservationid,
   *  paymentid, roomid, hotelid, StyleMedia, comments
   * ]} IndCustomerData
   *
   * @returns A SQL Query for an array of the newly added IndCustomer Obj
   */
  addNewIndCustomer(IndCustomerData = []) {
    const sql = `INSERT INTO ${this._IndCustomer}(BookingID, CustomerID, price_paid, tax, check_in, check_out, num_guests, reservationid, paymentID, roomid, hotelid, styleid, comments) VALUES(?,?,?,?,STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%sZ'),STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%sZ'),?,?,?,?,?,?,?);`;
    return mysql.format(sql, IndCustomerData);
  }

  /**
   * @param {Number} BookingID
   * @param {[email, phone, state]} updatedCustData
   * Can't Change Customer Names
   *
   * @returns A SQL Query for an array of the newly updated Customer Obj
   */
  updateCustomerByID(BookingID, updatedCustData = []) {
    const sql = `UPDATE ${this._Customer} SET email=?, phone=?, state=? WHERE id = '${BookingID}'`;
    return mysql.format(sql, updatedCustData);
  }

  /**
   * @param {Number} BookingID
   * @param {[
   *  price_paid, tax, check_in check_out, num_guests, reservationid, paymentid, roomid, hotelid, StyleMedia, comments
   * ]} updatedIndCustData
   *
   * @Note HotelID field is not neccessary but is kept for clearity
   * @Note Date Args are in YYYY-MM-DD[T]HH:MM:SS[Z] UTC Format
   *
   * @returns A SQL Query for an array of the newly updated IndCustomerObj
   */
  updateIndCustomerByID(BookingID, updatedIndCustData = []) {
    const sql = `UPDATE ${this._IndCustomer} SET price_paid=?, tax=?, check_in=STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%sZ'), check_out=STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%sZ'), num_guests=?, reservationid=?, paymentid=?, roomid=?, hotelid=?, styleid=?, comments=? WHERE bookingid = '${BookingID}'`;
    return mysql.format(sql, updatedIndCustData);
  }
}

module.exports = Customers;

/**
 * Module Dependencies
 */
const mysql = require('mysql2/promise');
const debug = require('debug')('motel:http');

// Curent Collection Service in MongoDB
const CurrReservation = require('../reservations/CurrRes');

/**
 * Customer Controller Class with Search and CRUD logic
 */
class Customer {
  /**
   * Set The SQL Connection Pool as Object State
   * @param {Object} pool The MySQL Connection Pool Object
   */
  constructor(pool) {
    this.pool = pool;
  }

  /** ****************************
   * SEARCH CONTROLLERS
   ***************************** */
  getAllCustomer() {
    const sql = 'SELECT * FROM Customer';
    return this.queryDB(sql)
      .then((res) => res)
      .catch((err) => Promise.reject(err));
  }

  async getIndCustomerByCheckIn(start, end) {
    let sql =
      'SELECT IndCustomer.BookingID, Customer.ID AS CustomerID, Customer.first_name AS firstName, Customer.last_name AS lastName, ';
    sql = sql.concat(
      'Customer.email AS email, Customer.phone AS phone, Customer.state AS StateID, IndCustomer.Num_Guests AS numGuests,'
    );
    sql = sql.concat(
      'IndCustomer.price_paid AS pricePaid, IndCustomer.tax, IndCustomer.check_in AS checkIn, IndCustomer.check_out AS checkOut, '
    );
    sql = sql.concat(
      'IndCustomer.roomid AS RoomID, IndCustomer.reservationid AS ReservationID, IndCustomer.paymentid AS PaymentID, IndCustomer.comments AS Comments '
    );
    sql = sql.concat(
      'FROM Customer INNER JOIN IndCustomer ON IndCustomer.CustomerID=Customer.ID WHERE IndCustomer.check_in BETWEEN ? AND ?;'
    );

    return this.queryDB(sql, [start, end])
      .then((res) => {
        debug(res);
        if (res[0].length === 0) {
          throw new Error('Failed to Find Match');
        }
        return res[0];
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  }

  getIndCustomerByCheckOut(start, end) {
    let sql =
      'SELECT IndCustomer.BookingID, Customer.ID AS CustomerID, Customer.first_name AS firstName, Customer.last_name AS lastName, ';
    sql = sql.concat(
      'Customer.email AS email, Customer.phone AS phone, Customer.state AS StateID, IndCustomer.Num_Guests AS numGuests,'
    );
    sql = sql.concat(
      'IndCustomer.price_paid AS pricePaid, IndCustomer.tax, IndCustomer.check_in AS checkIn, IndCustomer.check_out AS checkOut, '
    );
    sql = sql.concat(
      'IndCustomer.roomid AS RoomID, IndCustomer.reservationid AS ReservationID, IndCustomer.paymentid AS PaymentID, IndCustomer.comments AS Comments '
    );
    sql = sql.concat(
      'FROM Customer INNER JOIN IndCustomer ON IndCustomer.CustomerID=Customer.ID WHERE IndCustomer.check_out BETWEEN ? AND ?;'
    );

    return this.queryDB(sql, [start, end])
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

  async getIndCustomerByID(bookingid) {
    let sql =
      'SELECT IndCustomer.BookingID, Customer.ID AS CustomerID, Customer.first_name AS firstName, Customer.last_name AS lastName, ';
    sql = sql.concat(
      'Customer.email AS email, Customer.phone AS phone, Customer.state AS StateID, '
    );
    sql = sql.concat(
      'IndCustomer.price_paid AS pricePaid, IndCustomer.tax, IndCustomer.check_in AS checkIn, IndCustomer.check_out AS checkOut, IndCustomer.Num_Guests AS numGuests, '
    );
    sql = sql.concat(
      'IndCustomer.roomid AS RoomID, IndCustomer.reservationid AS ReservationID, IndCustomer.paymentid AS PaymentID, IndCustomer.comments AS comments '
    );
    sql = sql.concat(
      'FROM Customer INNER JOIN IndCustomer ON IndCustomer.CustomerID=Customer.ID WHERE IndCustomer.BookingID = ?;'
    );

    return this.queryDB(sql, [bookingid])
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

  getIndCustomerByFirstName(firstName) {
    let sql =
      'SELECT IndCustomer.BookingID, Customer.ID AS CustomerID, Customer.first_name AS firstName, Customer.last_name AS lastName, ';
    sql = sql.concat(
      'Customer.email AS email, Customer.phone AS phone, Customer.state AS StateID, IndCustomer.Num_Guests AS numGuests,'
    );
    sql = sql.concat(
      'IndCustomer.price_paid AS pricePaid, IndCustomer.tax, IndCustomer.check_in AS checkIn, IndCustomer.check_out AS checkOut, '
    );
    sql = sql.concat(
      'IndCustomer.roomid AS RoomID, IndCustomer.reservationid AS ReservationID, IndCustomer.paymentid AS PaymentID, IndCustomer.comments AS Comments '
    );
    sql = sql.concat(
      'FROM Customer INNER JOIN IndCustomer ON IndCustomer.CustomerID=Customer.ID WHERE Customer.first_name = ?;'
    );

    return this.queryDB(sql, [firstName])
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

  /** ****************************
   * CRUD CONTROLLERS
   ***************************** */

  /**
   * Add new Customer Record to MYSQL DB.
   *  If customer is a repeat customer, create new IndCustomer Record for Additional Stay
   *  If customer is new customer, create new Customer and IndCustomer Record
   *
   * @param {Array} info1 Customer Data for new Customer Record
   * @param {Array} info2 customer Data for new IndCustomer Record
   * @param {Date} date   Date of Customer Record in Daily Report
   * @param {Number} prevRoom The Room the customer was last occupied in
   * @param {String} roomType For Housekeeping Record, the type of Room is it
   */
  async addNewCustomer(info1 = [], info2 = [], date, prevRoom, roomType) {
    const sql1 =
      'INSERT INTO Customer(ID,YearID,MonthID,first_name,last_name,email,phone,state) VALUES(?,?,?,?,?,?,?,?);';

    const sql2 =
      'INSERT INTO IndCustomer(BookingID, CustomerID, price_paid, tax, check_in, check_out, num_guests, reservationid, paymentID, roomid, comments) VALUES(?,?,?,?,?,?,?,?,?,?,?);';

    const sql3 = 'SELECT * FROM Customer WHERE last_name=? AND first_name=?;';

    const result = await this.queryDB(sql3, [info1[4], info1[3]]);

    const bookingid = info2[0];

    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      if (result[0].length === 0) {
        // customer does not exist so create a new one
        const sqlQuery1 = mysql.format(sql1, info1);
        const sqlQuery2 = mysql.format(sql2, info2);

        await connection.query(sqlQuery1);
        await connection.query(sqlQuery2);
      } else {
        /**
         * customer exists already so add onto their stays and
         * change CustomerID so that it matches up
         */
        debug(result[0][0].id);
        const existingCustomerID = result[0][0].id;

        const info2Arr = info2;
        info2Arr[1] = existingCustomerID;
        debug(info2Arr);
        await this.queryDB(sql2, info2Arr);
      }

      // As guest has checked out so Remove Reservation from Current and DailyReport Collection
      const UpdatedReport = await CurrReservation.deleteReservationPerm(
        bookingid,
        date,
        roomType
      );
      await connection.commit();
      return UpdatedReport;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      await connection.release();
    }
  }

  /**
   * Update the Customer Record
   *
   * @param {Array} info1 Array that contains Data to Update the Customer Record
   * @param {Array} info2 Array that contains Data to Update the IndCustomer Record
   * @param {Number} BookingID BookingID of the Customer
   * @param {String} CustomerID CustomerID of the Customer
   */
  async updateCustomer(info1 = [], info2 = [], BookingID, CustomerID) {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      await this.updateCustomerByID(CustomerID, info1);
      await this.updateIndCustomerByID(BookingID, info2);

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      await connection.release();
    }

    return this.getIndCustomerByID(BookingID);
  }

  /**
   * Helper Function to Update Customer Record
   * @param {Number} id BookingID of the Customer
   * @param {Array} data Corresponding Data to Update
   */
  updateCustomerByID(id, data = []) {
    let sql =
      'UPDATE Customer SET first_name=?, last_name=?, email=?, phone=?, state=? ';
    sql = sql.concat(`WHERE id = '${id}'`);

    return this.queryDB(sql, data)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }

  /**
   * Helper Function to Update IndCustomer Record
   * @param {Number} id The BookingID of the Customer
   * @param {Array} data Corresponding Data to Update
   */
  updateIndCustomerByID(id, data = []) {
    let sql =
      'UPDATE IndCustomer SET price_paid=?, tax=?, check_in=?, check_out=?, num_guests=?, reservationid=?, ';
    sql = sql.concat(
      `paymentid=?, roomid=?, comments=? WHERE bookingid = '${id}'`
    );
    return this.queryDB(sql, data)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }

  /**
   * Helper Function to Perform Queries against MySQL DB
   * @param {String} sql The SQL Query
   * @param {Array} arr  The Corresponding Fields of the Query
   */
  async queryDB(sql, arr = []) {
    const sqlQuery = mysql.format(sql, arr);
    return this.pool.query(sqlQuery);
  }

  /**
   * Helper Functiont o Perform Transactional Queries against MySQL DB
   * @param {Array} queries Array of Objects that Contain the Queries and Corresponding Fields
   */
  async transQuery(queries = []) {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      queries.forEach(async (sqlQuery) => {
        await connection.query(mysql.format(sqlQuery.query, sqlQuery.data));
      });

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      await connection.release();
    }
  }
}

module.exports = Customer;

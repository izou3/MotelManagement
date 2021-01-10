const jwt = require('jsonwebtoken');
const decode = require('jwt-decode');

const config = require('../../config')[process.env.NODE_ENV || 'development'];
const StaffClass = require('../../lib/data-access/StaffClass/index');
const CustomerClass = require('../../lib/data-access/CustomerClass/index');

class Login {
  constructor(req, res, sqlPool) {
    this._req = req;
    this._res = res;
    this._pool = sqlPool;
  }

  async execute(HotelID) {
    const Staff = new StaffClass(HotelID);

    // Not neccessary as this doesn't return Motel/User info
    // Even if token already exists, if user tries to login
    // a different way, server will send new token for new user
    // if (this._req.user) {
    //   const { token } = this._req.cookies;
    //   return token;
    // }

    const query = { username: this._req.body.username };
    const staff = await Staff.findStaff(query);

    if (!staff) {
      throw new Error('Authentication Failed! No Staff Found');
    }

    if (!staff.comparePassword(this._req.body.password, staff.hashPassword)) {
      throw new Error('Authentication Failed! Wrong Password');
    }
    // Obtain Motel Info and Room Number List
    const Customer = new CustomerClass(staff.HotelID); // passes in HotelID as Number
    const Motels = await this._pool.query(Customer.getMotelInfo());
    if (Motels[0].length === 0) {
      throw new Error('Failed to Find Matching Motel');
    }

    let MotelRoomList = await this._pool.query(
      Customer.getMotelRoomList(Motels[0][0].Abbreviation)
    );
    if (MotelRoomList[0].length === 0) {
      throw new Error('Failed to Find Room Number List');
    }

    // Because Return Value from SQL is array of objects, so will
    // need to parse it to return array of room numbers
    MotelRoomList = MotelRoomList[0].reduce((arr, RoomNum) => {
      if (RoomNum[Motels[0][0].Abbreviation]) {
        arr.push(RoomNum[Motels[0][0].Abbreviation]);
      }
      return arr;
    }, []);

    const token = jwt.sign(
      {
        HotelID: staff.HotelID,
        _id: staff.id,
        email: staff.email,
        username: staff.username,
        firstName: staff.firstName,
        lastName: staff.lastName,
        position: staff.position,
      },
      config.jwtKey,
      {
        expiresIn: 3600, // 90 Minute Expiration Date
      }
    );

    const user = decode(token);

    return {
      token,
      user,
      MotelInfo: Motels[0][0],
      MotelRoom: MotelRoomList,
    };
  }
}

class Logout {
  constructor(req, res) {
    this._req = req;
    this._res = res;
  }

  execute() {
    this._res.clearCookie('token');
    this._res.send({ message: 'Successfully Logged Out' });
  }
}

module.exports = { Login, Logout };

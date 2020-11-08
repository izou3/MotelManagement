/**
 * Modular Dependencies
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const debug = require('debug')('motel:http');

const config = require('../config')[process.env.NODE_ENV || 'development'];

const StaffSchema = require('../models/Staff');

const Staff = mongoose.model('Staff', StaffSchema, 'Staff');

/**
 * Authentication Middlewares
 */
module.exports = {
  /**
   * Authenticate User
   */
  loginRequired: (req, res, next) => {
    if (req.user) {
      return next();
    }
    // 401 Error
    const error = new Error('Unauthorized User');
    error.status = 401;
    res.status(401);
    return next(error);
  },

  loginCheck: (req, res) => {
    if (req.user) {
      return res.status(200).send({ message: 'Authenticated' });
    }
    return res.status(401).send({ message: 'UnAuthorized Access' });
  },

  /**
   * Register New User
   */
  register: async (newStaff) => {
    const result = await Staff.findOne({
      $or: [{ email: newStaff.email }, { username: newStaff.username }],
    }).lean();

    if (result) {
      throw new Error(
        'Cannot Create new Staff with Existing Email or Username'
      );
    }

    const newUser = new Staff(newStaff);
    newUser.hashPassword = bcrypt.hashSync(newStaff.password, 10);
    return new Promise((resolve, reject) => {
      newUser.save('- _id -__v -hashPassword -created_date', (err, user) => {
        if (err) {
          reject(new Error('Failed to Create New Staff'));
        } else if (!user) {
          reject(new Error('Failed to Create New Staff'));
        }
        resolve({
          ...newStaff,
          password: undefined,
        });
      });
    });
  },
  /**
   * Login User
   */
  login: (req, res) => {
    if (req.user) {
      const { token } = req.cookies;
      return res
        .cookie('token', token, { httpOnly: true, SameSite: 'strict' })
        .send(token);
    }
    debug(req.body);
    return Staff.findOne(
      {
        username: req.body.username,
      },
      (err, staff) => {
        if (err) throw err;
        if (!staff) {
          debug('here in error');
          return res
            .status(401)
            .json({ message: 'Authentication Failed! No Staff Found' });
        }
        debug(staff);
        if (!staff.comparePassword(req.body.password, staff.hashPassword)) {
          return res
            .status(401)
            .json({ message: 'Authentication Failed! Wrong Password' });
        }
        const token = jwt.sign(
          {
            _id: staff.id,
            email: staff.email,
            username: staff.username,
            firstName: staff.firstName,
            lastName: staff.lastName,
            position: staff.position,
          },
          config.jwtKey,
          {
            expiresIn: 3600, // 60 Minute Expiration Date
          }
        );
        return res
          .cookie('token', token, { httpOnly: true, SameSite: 'strict' }) // Limit CSRF attacks
          .send(token);
      }
    );
  },
  /**
   * Logout User
   */
  logout: (req, res) => {
    res.clearCookie('token');
    res.send({ message: 'Successfully Logged Out' });
  },

  /**
   * CRUD Operations on Staff Collection
   */
  getAllStaff: async () => {
    const result = await Staff.find({})
      .select('-_id -__v -created_date -hashPassword')
      .lean();
    return result;
  },

  updateStaff: async (updatedStaff) => {
    if (updatedStaff.password)
      throw new Error('Cannot Change Password! Please reset it!');
    const updated = await Staff.findOneAndUpdate(
      { username: updatedStaff.username },
      { $set: updatedStaff }, // Only Modify Fields Except for Password
      { new: true }
    )
      .select('-_id -__v -created_date -hashPassword')
      .lean();
    return updated;
  },

  deleteStaff: async (username) => {
    const result = await Staff.findOneAndDelete({ username })
      .select('-_id -__v -created_date -hashPassword')
      .lean();
    return result;
  },
};

/**
 * Module Dependencies
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const debug = require('debug')('motel:http');

const { Schema } = mongoose;

/**
 * A Staff Object Schema
 */
const StaffSchema = new Schema({
  HotelID: {
    type: Number,
    require: true,
    trim: true,
  },
  firstName: {
    type: String,
    require: true,
    trim: true,
  },
  lastName: {
    type: String,
    require: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: false,
    default: '',
    trim: true,
  },
  hashPassword: {
    type: String,
    required: true,
    trim: true,
  },
  /**
   * 0 = Owner
   * 1 = Manager
   * 2 = Housekeeper
   */
  position: {
    type: Number,
    enum: [0, 1, 2],
    required: true,
    default: 3,
    trim: true,
  },
  created_date: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Staff Object method to match passwords on login
 * @param {String} password the user entered password
 * @param {String} hashPassword the hashed password stored under the corresponding staff object
 */
StaffSchema.methods.comparePassword = (password, hashPassword) => {
  debug('here in compare password');
  return bcrypt.compareSync(password, hashPassword);
};

module.exports = StaffSchema;

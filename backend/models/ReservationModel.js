/**
 * Module Dependencies
 */
const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * A Reservation Object Schema
 * 21 Fields
 */
const ReservationSchema = new Schema({
  Checked: {
    type: Number,
    enum: [0, 1, 2],
    required: true,
    trim: true,
  },
  HotelID: {
    type: Number,
    required: true,
    trim: true,
    index: true,
  },
  BookingID: {
    type: Number,
    required: true,
    trim: true,
    index: true,
  },
  CustomerID: {
    type: String,
    required: true,
    trim: true,
  },
  YearID: {
    type: Number,
    required: true,
    trim: true,
  },
  MonthID: {
    type: Number,
    required: true,
    trim: true,
  },
  ReservationID: {
    type: Number,
    enum: [0, 1, 2, 3, 4],
    trim: true,
  },
  PaymentID: {
    type: Number,
    enum: [0, 1, 2, 3],
    trim: true,
  },
  RoomID: {
    type: Number,
    required: true,
  },
  StyleID: {
    type: Number,
    enum: [0, 1, 2, 3, 4],
    trim: true,
  },
  StateID: {
    type: String,
    required: false,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    indeX: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: false,
    default: '',
    trim: true,
  },
  phone: {
    type: Number,
    required: false,
    default: 0,
    trim: true,
  },
  pricePaid: {
    type: Number,
    required: true,
    trim: true,
  },
  tax: {
    type: Number,
    required: true,
    trim: true,
  },
  checkIn: {
    type: Date,
    required: true,
    trim: true,
    index: true,
  },
  checkOut: {
    type: Date,
    required: true,
    trim: true,
    index: true,
  },
  numGuests: {
    type: Number,
    required: true,
    trim: true,
  },
  comments: {
    type: String,
    required: false,
    default: '',
    trim: true,
  },
  created_date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = ReservationSchema;

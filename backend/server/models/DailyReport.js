/**
 * Module Dependencies
 */
const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Room Schema for each each individual room in General Report
 */
const ReservationSchema = new Schema({
  BookingID: {
    type: Number,
    require: false,
  },
  // Options are N, S/O, WK1-3, NO
  type: {
    type: String,
    require: true,
    trim: true,
  },
  // Options are C, CC
  payment: {
    type: String,
    required: false,
    trim: true,
  },
  startDate: {
    type: Date,
    required: false,
  },
  endDate: {
    type: Date,
    required: false,
  },
  paid: {
    type: Boolean,
    required: false,
  },
  rate: {
    type: Number,
    required: false,
  },
  tax: {
    type: Number,
    required: false,
  },
  notes: {
    type: String,
    required: false,
    trim: true,
  },
  initial: {
    type: String,
    required: false,
    trim: true,
  },
});

/**
 * HouseKeeping Schema for Housekeeping for Each Room
 */
const HouseKeepingSchema = new Schema({
  status: {
    type: String,
    required: false,
    trim: true,
  },
  type: {
    type: String,
    required: false,
    trim: true,
  },
  houseKeeper: {
    type: String,
    required: false,
    trim: true,
  },
  notes: {
    type: String,
    required: false,
    trim: true,
  },
});

const RoomSchema = new Schema({
  Room: ReservationSchema,
  HouseKeeping: HouseKeepingSchema,
});

/**
 * StaySchema for all the Rooms
 */
const StaySchema = new Schema({
  101: RoomSchema,
  102: RoomSchema,
  103: RoomSchema,
  104: RoomSchema,
  105: RoomSchema,
  106: RoomSchema,
  107: RoomSchema,
  108: RoomSchema,
  109: RoomSchema,
  110: RoomSchema,
  111: RoomSchema,
  112: RoomSchema,
  113: RoomSchema,
  114: RoomSchema,
  115: RoomSchema,
  116: RoomSchema,
  117: RoomSchema,
  118: RoomSchema,
  119: RoomSchema,
  120: RoomSchema,
  121: RoomSchema,
  122: RoomSchema,
  123: RoomSchema,
  124: RoomSchema,
  125: RoomSchema,
  126: RoomSchema,
});

/**
 * Refund Schema for the total refund and additional comments
 * per daily report
 */
const RefundSchema = new Schema({
  Amount: {
    type: Number,
    required: false,
    default: 0,
  },
  Notes: {
    type: String,
    require: false,
    trim: true,
  },
});

/**
 * The DailyReport for a Given Day
 */
const DailyReportSchema = new Schema({
  YearID: {
    type: Number,
    required: true,
  },
  MonthID: {
    type: Number,
    required: true,
  },
  Date: {
    type: Date,
    required: true,
    index: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  Stays: StaySchema,
  Refund: RefundSchema,
});

module.exports = DailyReportSchema;

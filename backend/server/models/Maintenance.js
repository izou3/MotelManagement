/**
 * Module Dependencies
 */
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const { Schema } = mongoose;

/**
 * Schema for the Maintenance Log Collection
 */
const mainteanceLogEntries = new Schema({
  // id: {
  //   type: Number,
  //   required: true,
  // },
  completed: {
    type: Boolean,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  cost: {
    type: Number,
    required: false,
    trim: true,
  },
});

const MaintenanceLog = new Schema(
  {
    _id: {
      type: Number,
    },
    Name: {
      type: String,
      required: true,
      trim: true,
      index: true,
      default: 'General',
    },
    Facilities: [mainteanceLogEntries],
    101: [mainteanceLogEntries],
    102: [mainteanceLogEntries],
    103: [mainteanceLogEntries],
    104: [mainteanceLogEntries],
    105: [mainteanceLogEntries],
    106: [mainteanceLogEntries],
    107: [mainteanceLogEntries],
    108: [mainteanceLogEntries],
    109: [mainteanceLogEntries],
    110: [mainteanceLogEntries],
    111: [mainteanceLogEntries],
    112: [mainteanceLogEntries],
    113: [mainteanceLogEntries],
    114: [mainteanceLogEntries],
    115: [mainteanceLogEntries],
    116: [mainteanceLogEntries],
    117: [mainteanceLogEntries],
    118: [mainteanceLogEntries],
    119: [mainteanceLogEntries],
    120: [mainteanceLogEntries],
    121: [mainteanceLogEntries],
    122: [mainteanceLogEntries],
    123: [mainteanceLogEntries],
    124: [mainteanceLogEntries],
    125: [mainteanceLogEntries],
    126: [mainteanceLogEntries],
  },
  { _id: false }
);
MaintenanceLog.plugin(AutoIncrement);

module.exports = MaintenanceLog;

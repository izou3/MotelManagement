/**
 * Module Dependencies
 */
const mongoose = require('mongoose');
const debug = require('debug')('motel:http');
const MaintenanceLogSch = require('../../models/Maintenance');

// Mongoose Schema Model
const MaintenanceLog = mongoose.model(
  'MaintenanceLog',
  MaintenanceLogSch,
  'MaintenanceLog'
);

class Maintenance {
  /**
   * Obtain JSON Object of a Maintenance Log with Matching name args
   * @param {String} name The name of the Maintenance Log
   */
  static async getMaintenanceLogByName(name) {
    const maintenanceLog = await MaintenanceLog.findOne({ Name: name })
      .select('-_id -__v -Name')
      .lean();
    if (!maintenanceLog) throw new Error('Maintenance Log Does Not Exist');
    return maintenanceLog;
  }

  /**
   * Obtain JSON Object of a Maintenance Log with Matching name args
   * @param {Number} id The name of the Maintenance Log
   */
  static async getMaintenanceLogByID(id) {
    const maintenanceLog = await MaintenanceLog.findOne({ _id: id })
      .select('-_id -__v')
      .lean();
    if (!maintenanceLog) throw new Error('Maintenance Log Does Not Exist');
    return maintenanceLog;
  }

  /**
   * Get names of all the Maintenance Log for Searching Purposes
   */
  static async getMaintenanceLogNames() {
    const result = await MaintenanceLog.find({}).select('Name').lean();
    if (!result) throw new Error('Maintenance Log Does Not Exist');
    return result;
  }

  /**
   * Generates a new Maintenace Log
   * @param {String} name The Name of the new Maintenance Log
   */
  static async generateNewMaintenanceLog(name) {
    const blankMaintenanceLog = {
      Name: name,
      Facilities: [],
      101: [],
      102: [],
      103: [],
      104: [],
      105: [],
      106: [],
      107: [],
      108: [],
      109: [],
      110: [],
      111: [],
      112: [],
      113: [],
      114: [],
      115: [],
      116: [],
      117: [],
      118: [],
      119: [],
      120: [],
      121: [],
      122: [],
      123: [],
      124: [],
      125: [],
      126: [],
    };
    const newMaintenanceLog = new MaintenanceLog(blankMaintenanceLog);
    const result = await newMaintenanceLog.save();
    return result;
  }

  /**
   * Deletes a Maintenance Log
   * @param {String} name The Name of the Maintenance Log to Delete
   */
  static async deleteMaintenanceLog(name) {
    const result = await MaintenanceLog.findOneAndDelete({ Name: name })
      .select('-_id -__v')
      .lean();
    if (!result) throw new Error('Maintenance Log Does Not Exist');
    return result;
  }

  /**
   * Add a New Log Entry to a Room or Facility Array to Matching Mainteance Log
   *
   * Deficencies: Error is Not Thrown if Nested Fields Failt to Match
   *
   * @param {String} name The Name of the Maintenance Log to Update
   * @param {String} field Either facilites of the room number of the Maintenance Log
   * @param {Object} entry object of the new entry
   */
  static async addIndividualLogEntry(name, field, entry) {
    const newLogEntry = { $push: {} };
    newLogEntry.$push[`${field}`] = entry;
    const maintenanceLog = await MaintenanceLog.findOneAndUpdate(
      { Name: name },
      newLogEntry,
      { new: true }
    ).select('-__v -_id -Name');
    if (!maintenanceLog) {
      throw new Error('Failed to Find Match');
    }
    return maintenanceLog;
  }

  /**
   * Deletes an Individual Log Entry from Matching Maintenance Log
   *
   * Deficencies: Error is Not Thrown if Nested Fields Failt to Match
   *
   * @param {String} name The Name of the Maintenance Log to Delete from
   * @param {String} field The field of the Maintenance Log
   * @param {Number} id The ID of the Log Entry
   */
  static async deleteIndividualLogEntry(name, field, ID) {
    const delLogEntry = { $pull: {} };
    delLogEntry.$pull[`${field}`] = { _id: ID };
    debug(delLogEntry);
    return new Promise((resolve, reject) => {
      MaintenanceLog.findOneAndUpdate(
        { Name: name },
        delLogEntry,
        { new: true },
        (err, data) => {
          if (err) {
            debug('here in error');
            reject(err);
          } else {
            debug('successful');
            resolve(data);
          }
        }
      ).select('-__v -_id -Name');
    });
  }

  /**
   * Updates an Individual Log Entry From Matching Maintenance Log
   *
   * Deficencies: Error is Not Thrown if Nested Fields Failt to Match
   *
   * @param {String} name The Name of the Maintenance Log to Update
   * @param {String} field The field of the Maintenance Log
   * @param {Object} entry The Updated Object of the Log Entry
   */
  static async updateIndividualLogEntry(name, field, entry) {
    const identifier = {};
    identifier.Name = name;
    // eslint-disable-next-line no-underscore-dangle
    identifier[`${field}._id`] = entry._id;

    const updateEntry = { $set: {} };
    updateEntry.$set[`${field}.$`] = entry;
    debug(identifier);
    debug(updateEntry);
    const result = await MaintenanceLog.findOneAndUpdate(
      identifier,
      updateEntry,
      { new: true }
    ).select('-__v -_id -Name');

    if (!result) {
      throw new Error('Failed to Find Match');
    }
    return result;
  }
}

module.exports = Maintenance;

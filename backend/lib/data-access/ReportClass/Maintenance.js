const mongoose = require('mongoose');

const Report = require('./index');
const MaintenanceModel = require('../../../models/Maintenance');

class Maintenance extends Report {
  /**
   * Creates new instance to reference DailyReport Collection
   * @param {Number} HotelID
   * @returns New instance to reference DailyReport Collection
   */
  constructor(HotelID) {
    super(HotelID);
    this._connection = mongoose.model(
      'MaintenanceLog',
      MaintenanceModel,
      'MaintenanceLog'
    );
    switch (HotelID) {
      case Maintenance.getLazyUID: {
        this._HotelID = Maintenance.getLazyUID;
        break;
      }
      case Maintenance.getFairValueID: {
        this._HotelID = Maintenance.getFairValueID;
        break;
      }
      default:
        this._HotelID = null;
    }
  }

  /**
   * Returns Current Referenced HotelID
   */
  get HotelID() {
    return this._HotelID;
  }

  /**
   * Get names of all the Maintenance Log for Searching Purposes
   * @returns Array of Objects with Name and_id field
   */
  getMaintenanceLogNames() {
    return this._connection
      .find({ HotelID: this._HotelID })
      .select('Name')
      .lean();
  }

  /**
   * Deletes Maintenance Log
   * @param {String} name
   * @returns Deleted Maintenance Log
   */
  deleteMaintenanceLog(name) {
    return this._connection
      .findOneAndDelete({
        $and: [{ Name: name }, { HotelID: this._HotelID }],
      })
      .select('-_id -__v')
      .lean();
  }

  /**
   * Add a New Log Entry to a Room or Facility Array to Matching Mainteance Log
   *
   * @Note Error is Not Thrown if Nested Fields Fail to Match/Invalid
   *
   * @param {String} name The Name of the Maintenance Log to Update
   * @param {String} RoomID Either facilites of the room number of the Maintenance Log
   * @param {Object} entry object of the new entry
   * @param {Boolean} isNewReport Whether Report Returned is new or original
   *
   * @returns New/Original Maintenance Object
   */
  addIndividualLogEntry(name, RoomID, entry, isNewReport = true) {
    const newLogEntry = { $push: {} };
    newLogEntry.$push[`${RoomID}`] = entry;
    return this._connection
      .findOneAndUpdate(
        {
          $and: [{ Name: name }, { HotelID: this._HotelID }],
        },
        newLogEntry,
        { new: isNewReport }
      )
      .select('-__v -_id -Name -HotelID -126');
  }

  /**
   * Updates an Individual Log Entry From Matching Maintenance Log
   *
   * @NOTE Error is NOT Thrown if Nested Fields Fail to Match
   * Or are undefined like if field = undefined
   *
   * @param {String} name The Name of the Maintenance Log to Update
   * @param {String} RoomID The field of the Maintenance Log
   * @param {Object} entry The Updated Object of the Log Entry
   * @param {Boolean} isNewReport Whether Report Returned is new or original
   *
   * @returns New/Original Maintenance Object
   */
  updateIndividualLogEntry(name, RoomID, entry, isNewReport = true) {
    const identifier = {};
    identifier.Name = name;
    identifier.HotelID = this._HotelID;
    identifier[`${RoomID}._id`] = entry._id;

    const updateEntry = { $set: {} };
    updateEntry.$set[`${RoomID}.$`] = entry;

    return this._connection
      .findOneAndUpdate(identifier, updateEntry, { new: isNewReport })
      .select('-__v -_id -Name -HotelID -126');
  }

  /**
   * Deletes an Individual Log Entry from Matching Maintenance Log
   *
   * @Note Error is Not Thrown if Nested Fields Fail to Match
   *
   * @param {String} name The Name of the Maintenance Log to Delete from
   * @param {String} field The field of the Maintenance Log
   * @param {Number} LogID The ID of the Log Entry
   * @param {Boolean} isNewReport Whether Report Returned is new or original
   *
   * @returns New/Original Maintenance Object
   */
  deleteIndividualLogEntry(name, RoomID, LogID, isNewReport = true) {
    const delLogEntry = { $pull: {} };
    delLogEntry.$pull[`${RoomID}`] = { _id: LogID };
    return this._connection
      .findOneAndUpdate(
        {
          $and: [{ Name: name }, { HotelID: this._HotelID }],
        },
        delLogEntry,
        { new: isNewReport }
      )
      .select('-__v -_id -Name -HotelID -126');
  }

  /**
   * Generates a new Maintenance Log
   * @param {String} name The Name of the new Maintenance Log
   */
  generateNewMaintenanceLog(name) {
    const MaintenanceLogTemplate = {
      Name: name,
      HotelID: this._HotelID,
      Facilities: [],
    };
    for (let i = 101; i <= 100 + Maintenance.getRoomNum; i++) {
      MaintenanceLogTemplate[`${i}`] = [];
    }
    return MaintenanceLogTemplate;
  }
}

module.exports = Maintenance;

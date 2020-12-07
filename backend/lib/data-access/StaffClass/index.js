const mongoose = require('mongoose');
const Motel = require('../Motel');
const StaffModel = require('../../../models/Staff');

class Staff extends Motel {
  /**
   * Create new instance to reference Staff Collection
   * @param {Number} HotelID
   * @returns New instance to reference Staff Collection
   */
  constructor(HotelID) {
    super(HotelID);
    this._connection = mongoose.model('Staff', StaffModel, 'Staff');
  }

  /**
   * @param {Number} HotelID
   * @returns Array of all staff belonging a Hotel
   */
  getAllStaffByHotelID(HotelID) {
    return this._connection
      .find({ HotelID })
      .select('-_id -__v -created_date -hashPassword')
      .lean();
  }

  /**
   * @param {Object} query
   * @returns An object matching mongoose query object
   */
  findStaff(query) {
    return this._connection.findOne(query);
  }

  /**
   * @param {Object} newStaffObj
   * @returns Array of Length 1 with Arr[0] = newStaffObj
   */
  createNewStaff(newStaffObj) {
    return this._connection.create([newStaffObj]);
  }

  /**
   * @Note No Need to Differntiate with HotelID as all usernames are unique
   * @param {Object} updatedStaffObj
   * @param {Boolean} isNewStaff
   */
  updateStaff(updatedStaffObj, isNewStaff = true) {
    return this._connection
      .findOneAndUpdate(
        { username: updatedStaffObj.username },
        { $set: updatedStaffObj }, // Only Modify Fields Except for Password
        { new: isNewStaff }
      )
      .select('-_id -__v -created_date -hashPassword')
      .lean();
  }

  /**
   * @param {String} username
   * @returns An object matching username that was just removed
   */
  deleteStaff(username) {
    return this._connection
      .findOneAndDelete({ username })
      .select('-_id -__v -created_date -hashPassword')
      .lean();
  }
}

module.exports = Staff;

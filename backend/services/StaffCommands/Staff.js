const bcrypt = require('bcrypt');

const StaffClass = require('../../lib/data-access/StaffClass/index');

class SearchAllStaff {
  constructor(HotelID) {
    this._HotelID = HotelID;
  }

  async execute(HotelID) {
    const Staff = new StaffClass(HotelID);
    const result = await Staff.getAllStaffByHotelID(this._HotelID);

    if (result.length === 0) {
      throw new Error('No Staff Found');
    }

    return result;
  }
}

class AddNewStaff {
  constructor(newStaffObj) {
    this._NewStaffObj = newStaffObj;
  }

  async execute(HotelID) {
    const Staff = new StaffClass(HotelID);

    const query = {
      $or: [
        { email: this._NewStaffObj.email },
        { username: this._NewStaffObj.username },
      ],
    };

    const result = await Staff.findStaff(query);

    if (result) {
      throw new Error(
        'Cannot Create new Staff with Existing Email or Username'
      );
    }

    this._NewStaffObj.hashPassword = bcrypt.hashSync(
      this._NewStaffObj.password,
      10
    );

    this._NewStaffObj.HotelID = HotelID;

    const newStaff = await Staff.createNewStaff(this._NewStaffObj);

    if (!newStaff || newStaff.length === 0)
      throw new Error('Failed to Create New Staff');

    return {
      HotelID: newStaff[0].HotelID,
      firstName: newStaff[0].firstName,
      lastName: newStaff[0].lastName,
      username: newStaff[0].username,
      email: newStaff[0].email,
      position: newStaff[0].position,
    };
  }
}

class UpdateStaff {
  constructor(updatedStaffObj) {
    this._UpdatedStaffObj = updatedStaffObj;
  }

  async execute(HotelID) {
    const Staff = new StaffClass(HotelID);

    if (this._UpdatedStaffObj.password) {
      throw new Error('Cannot Change Password! Please reset it!');
    }

    const updatedStaff = await Staff.updateStaff(this._UpdatedStaffObj, true);

    if (!updatedStaff) {
      throw new Error('No Staff with Username Found');
    }

    return updatedStaff;
  }
}

class DeleteStaff {
  constructor(username) {
    this._username = username;
  }

  async execute(HotelID) {
    const Staff = new StaffClass(HotelID);

    const result = await Staff.deleteStaff(this._username);

    if (!result) {
      throw new Error('Username Does Not Exist');
    }

    return result;
  }
}

module.exports = { SearchAllStaff, AddNewStaff, UpdateStaff, DeleteStaff };

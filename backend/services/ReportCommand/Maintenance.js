const MaintenanceClass = require('../../lib/data-access/ReportClass/Maintenance');

class SearchMaintenanceLogByName {
  constructor(name) {
    this._name = name;
  }

  async execute(HotelID) {
    const Maintenance = new MaintenanceClass(HotelID);
    const maintenanceLog = await Maintenance.getReport({
      $and: [{ Name: this._name }, { HotelID }],
    });
    if (!maintenanceLog) throw new Error('Maintenance Log Does Not Exist');
    return maintenanceLog;
  }
}

class SearchAllMaintenanceLogNames {
  constructor(HotelID) {
    this._HotelID = HotelID;
  }

  async execute(HotelID) {
    const Maintenance = new MaintenanceClass(this._HotelID);
    const result = await Maintenance.getMaintenanceLogNames();
    if (!result.length) throw new Error('No Names Exists');
    return result;
  }
}

class GenerateNewMaintenanceLog {
  constructor(name) {
    this._name = name;
  }

  async execute(HotelID) {
    const Maintenance = new MaintenanceClass(HotelID);
    const blackMaintenanceLog = Maintenance.generateNewMaintenanceLog(
      this._name
    );

    const newMaintenanceLog = await Maintenance.insertReport(
      blackMaintenanceLog
    );

    if (!newMaintenanceLog || newMaintenanceLog.length === 0) {
      throw new Error('Failed to Insert Maintenance Log');
    }

    console.log(newMaintenanceLog);
    return {
      blankLog: {
        ...blackMaintenanceLog,
        Name: undefined,
        HotelID: undefined,
        _id: undefined,
        __v: undefined,
      },
      Name: this._name,
      _id: newMaintenanceLog[0]._id,
    };
  }
}

class DeleteMaintenanceLogByName {
  constructor(name) {
    this._name = name;
  }

  async execute(HotelID) {
    if (this._name === 'General') {
      throw new Error('Cannot Delete General Maintenance Sheet');
    }

    const Maintenance = new MaintenanceClass(HotelID);
    const CurrentMaintenanceLogs = await Maintenance.getMaintenanceLogNames();

    if (CurrentMaintenanceLogs.length === 1) {
      throw new Error('Cannot Delete Only Maintenance Log Left');
    }

    const result = await Maintenance.deleteMaintenanceLog(this._name);
    if (!result) throw new Error('Maintenance Log Does Not Exist');
    return result;
  }
}

class CreateMaintenanceEntry {
  constructor(name, field, newEntry) {
    this._name = name;
    this._field = field;
    this._NewEntry = newEntry;
  }

  async execute(HotelID) {
    const Maintenance = new MaintenanceClass(HotelID);

    const maintenanceLog = await Maintenance.addIndividualLogEntry(
      this._name,
      this._field,
      this._NewEntry,
      true
    );
    if (!maintenanceLog) {
      throw new Error('Failed to Find Matching Maintenance Sheet');
    }
    return maintenanceLog;
  }
}

class UpdateMaintenanceEntry {
  constructor(name, field, updatedEntry) {
    this._name = name;
    this._field = field;
    this._UpdatedEntry = updatedEntry;
  }

  async execute(HotelID) {
    const Maintenance = new MaintenanceClass(HotelID);

    const result = await Maintenance.updateIndividualLogEntry(
      this._name,
      this._field,
      this._UpdatedEntry,
      true
    );

    if (!result) {
      throw new Error('Failed to Find Match');
    }
    return result;
  }
}

class DeleteMaintenanceEntry {
  constructor(name, field, EntryID) {
    this._name = name;
    this._field = field;
    this._EntryID = EntryID;
  }

  async execute(HotelID) {
    const Maintenance = new MaintenanceClass(HotelID);

    const result = Maintenance.deleteIndividualLogEntry(
      this._name,
      this._field,
      this._EntryID,
      true
    );

    if (!result) {
      throw new Error('Failed to Find Match');
    }
    return result;
  }
}

module.exports = {
  SearchMaintenanceLogByName,
  SearchAllMaintenanceLogNames,
  GenerateNewMaintenanceLog,
  DeleteMaintenanceLogByName,
  CreateMaintenanceEntry,
  UpdateMaintenanceEntry,
  DeleteMaintenanceEntry,
};

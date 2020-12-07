require('dotenv').config();

const LazyUConfig = require('../../config/LazyU')[
  process.env.NODE_ENV || 'development'
];

const FairValueConfig = require('../../config/FairValue')[
  process.env.NODE_ENV || 'development'
];

/**
 * Main Parent Class. All New DB instances inherit this class
 */
class Motel {
  /**
   * New Motel Instance
   * @param {Number} HotelID
   * @returns New Motel Instance with static variables based on args
   */
  constructor(HotelID) {
    // Constant Static Variables
    Object.defineProperty(Motel, '_LazyUID', {
      value: LazyUConfig.HotelID,
    });
    Object.defineProperty(Motel, '_FairValueID', {
      value: FairValueConfig.HotelID,
    });
    switch (HotelID) {
      case Motel._LazyUID:
        Motel._RoomNum = LazyUConfig.RoomNum;
        Motel._MotelName = LazyUConfig.MotelName;
        Motel._Phone = LazyUConfig.Phone;
        Motel._Address = LazyUConfig.Address;
        break;
      case Motel._FairValueID:
        Motel._RoomNum = FairValueConfig.RoomNum;
        Motel._MotelName = FairValueConfig.MotelName;
        Motel._Phone = FairValueConfig.Phone;
        Motel._Address = FairValueConfig.Address;
        break;
      default:
        Motel.RoomNum = 0;
        Motel.MotelName = null;
        Motel._Phone = 0;
        Motel._Address = null;
    }
  }

  /**
   * @returns Number of Rooms of the Motel
   */
  static get getRoomNum() {
    return Motel._RoomNum;
  }

  /**
   * @returns Name of the Motel
   */
  static get getMotelName() {
    return Motel._MotelName;
  }

  /**
   * @returns Phone Number of the Motel
   */
  static get getMotelPhone() {
    return Motel._Phone;
  }

  /**
   * @returns Address of the Motel
   */
  static get getMotelAddress() {
    return Motel._Address;
  }

  /**
   * @returns HotelID of Motel 1
   */
  static get getLazyUID() {
    return Motel._LazyUID;
  }

  /**
   * @returns HotelID of Motel 2
   */
  static get getFairValueID() {
    return Motel._FairValueID;
  }
}

module.exports = Motel;

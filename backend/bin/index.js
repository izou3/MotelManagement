const mongoose = require('mongoose');
const EventEmitter = require('events');

const ReservationSchema = require('../server/models/ReservationModel');
const config = require('../server/config')[
  process.env.NODE_ENV || 'development'
];
const mongoDB = require('../server/lib/mongo.js');

const mongoPromise = async () =>
  mongoDB.connectMongo(
    'mongodb+srv://dbUser:HSclock36@cluster0-lilyg.mongodb.net/MotelManagement?retryWrites=true&w=majority'
  );

class EmailJobs extends EventEmitter {
  static sendEmailJobs(data) {
    console.log('hello');
    console.log(data);
  }
}
const emailJobs = new EmailJobs();

class Motel {
  constructor(HotelID) {
    switch (HotelID) {
      case 0:
        Object.defineProperty(Motel, '_RoomNum', { value: 23 });
        break;
      case 1:
        Object.defineProperty(Motel, '_RoomNum', { value: 23 });
        break;
      default:
        Object.defineProperty(Motel, '_RoomNum', { value: null });
    }
    Motel._LazyUID = 0;
    Motel._FairValueID = 1;
  }

  static get getRoomNum() {
    return Motel._RoomNum;
  }

  static get getLazyUID() {
    return Motel._LazyUID;
  }

  static get getFairValueID() {
    return Motel._FairValueID;
  }
}

class Reservation extends Motel {
  get getConnection() {
    return this._connection;
  }

  getAllReservations() {
    return this._connection.find({}).select('-__v -_id -created_date').lean();
  }

  // Returns Array of length 1 with Arr[0] = resObj
  createOneNewReservation(resObj, session = null) {
    if (session) {
      emailJobs.emit('sendEmail', 'heed');
      return this._connection.create([resObj], { session });
    }
    return this._connection.create([resObj]);
  }
}

class CurrentReservation extends Reservation {
  constructor(HotelID) {
    super(HotelID);
    switch (HotelID) {
      case CurrentReservation.getLazyUID: {
        this._connection = mongoose.model(
          'Reservation',
          ReservationSchema,
          'CurrentReservation'
        );
        break;
      }
      case CurrentReservation.getFairValueID: {
        this._connection = mongoose.model(
          'Reservation',
          ReservationSchema,
          'PendingReservation'
        );
        break;
      }
      default:
        this._connection = null;
    }
  }
}

class PendingReservation extends Reservation {
  constructor(HotelID) {
    super(HotelID);
    switch (HotelID) {
      case 0: {
        this._connection = mongoose.model(
          'Reservation',
          ReservationSchema,
          'PendingReservation'
        );
        break;
      }
      case 1: {
        this._connection = {
          connectionString: 'hello Current FairValue',
        };
        break;
      }
      default:
        this._connection = null;
    }
  }
}

Promise.resolve(mongoPromise())
  .then(async () => {
    console.log('connected');
    const Current = new CurrentReservation(0);
    const Pending = new PendingReservation(0);

    emailJobs.once('sendEmail', (data) => EmailJobs.sendEmailJobs(data));

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result1 = await Current.createOneNewReservation(
        {
          email: 'ivanz@gamil.com',
          phone: 5058934500,
          comments: '',
          YearID: 2020,
          MonthID: 1,
          BookingID: 1,
          CustomerID: 'zoui35',
          firstName: 'Ivan',
          lastName: 'Zou',
          ReservationID: 2,
          PaymentID: 1,
          RoomID: 102,
          StateID: 'MA',
          pricePaid: 67.89,
          tax: 4.56,
          checkIn: '2020-10-18T12:00:00.000+00:00',
          checkOut: '2020-10-20T12:00:00.000+00:00',
          numGuests: 2,
          Checked: 2,
        },
        session
      );

      const result2 = await Pending.createOneNewReservation(
        {
          email: 'ivanz@gamil.com',
          phone: 5058934500,
          comments: '',
          YearID: 2020,
          MonthID: 1,
          BookingID: 1,
          CustomerID: 'zoui35',
          firstName: 'Ivan',
          lastName: 'Zou',
          ReservationID: 2,
          PaymentID: 1,
          RoomID: 102,
          StateID: 'MA',
          pricePaid: 67.89,
          tax: 4.56,
          checkIn: '2020-10-18T12:00:00.000+00:00',
          checkOut: '2020-10-20T12:00:00.000+00:00',
          numGuests: 2,
          Checked: 2,
        },
        session
      );

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }

    console.log('done');
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

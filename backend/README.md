# Available Scripts #
Below are npm scripts you can run in the Backend Directory

### `npm run coverage`

Runs and Generates an HTML Code Coverage Report. <br />
Locate the newly created coverage directory and open the index.html in your preferred browser.

### `npm test`
Runs Mocha-Chai Test Suites located under the test folder in the Backend Directory

### `npm start`
Runs the backend API server in development mode using nodemon for reloading and restarting an changes.<br />
Open [http://localhost:3001](http://localhost:3001) to acess the server through its endpoints. 

### `npm run agenda`
Runs the background processing server in development mode through AgendaJS.<br />
Open [http://localhost:3002/dash](http://localhost:3002/dash) to access the dashboard containing the Agenda Job Queue.

### `npm run debug`
Runs the backend API server in debug mode using nodemon for reloading and restarting an changes as well as debug module for logging.<br />
Open [http://localhost:3001](http://localhost:3001) to acess the server through its endpoints. 

### `npm run build:api`
Builds the backend API server for production to the `dist` folder.<br />
It correctly bundes the Express API server using webpack to optimize for best performance.

### `npm run build:jobs`
Builds the AgendaJS worker process for production to the `dist` folder.<br />
It correctly bundes the background processing server using webpack to optimize for best performance.

### `npm run start:prodAPI`
Runs the backend API server in production mode.<br />
Open [http://localhost:3001/api](http://localhost:3001/api) to acess the server through its endpoints. 

### `npm run start:prodJobs`
Runs the background processing server in production mode.<br />
Open [http://localhost:3002/dash](http://localhost:3002/dash) to access the dashboard containing the Agenda Job Queue.

### `npm run migrateToProd` 
Migrates the MySQL tables to the Production Environment specificed in the `.env` file. 

### `npm run seedToProd` 
Migrates the MySQL seeds to the Production Environment specificed in the `.env` file.

### `npm run undoAllProdMigrations`
Undoes the seed and tables migration to the Production Environment specificed in the `.env` file.


# Documentation #
The Backend Server serves two different hotel management systems, with each having 26 rooms total. For the database usage, both hotels share the same `CurrentReservation, PendingReservation, and DeleteReservation` collections, as well as `Staff, Job Queue, and Maintenance`. The only separate collection created is a DailyReport collection for each motel. 

When the reservations are checked out, all customers are stored under same SQL tables with `HotelID` field to differentiate the different customrs.

3 Layers of Abstraction to preserve encapsulation.

  * Controller Layer: API Routes/Job Definitions
  * Service Layer: Business Logic though Command Pattern. 
  * Data-Access Layer: OO Model with classes for CRUD operations in each table/collection

<div align="center">
<img src="https://user-images.githubusercontent.com/55326650/101309870-608c1e00-381b-11eb-8303-6c6032fb1faf.JPG"  width="80%" height="80%">
</div>

## Data-Access Layer ##

<div align="center">
<img src="https://user-images.githubusercontent.com/55326650/101309954-9df0ab80-381b-11eb-9aa2-35a4ba5ccf9d.JPG"  width="80%" height="80%">
</div>

**Motel Adapter Parent Class**: The Main Parent Class. This class determines which motel its children should be working out of as well as define static variables associated with the specific motel. This class uses the adapter pattern to be able to adapt to the specific motel that the API requests. Currently there are two motels in use that the API server serves but can easily add new properties by adding. 

```javascript 
  class Model {
    // Static Private Attributes
    static _RoomNum;
    static _MotelName;
    static _MotelPhone;
    static _MotelAddress;
    static LazyUID;
    static FairValueID;
  }
```

**Reservation Class**: Subclass of the Motel Object but parent to the `CurrentReservation`, `PendingReservation`, and `DeleteReservation`, which each reference their corresponding collections. The `Reservation Class` contins CRUD methods that its subclasses inherit. 

```javascript
  class Reservation extends Model {
    get getConnection() // References the mongoose model object initialized in the subclass

    // CRUD Instance Methods 

    // Read Methods
    function getAllReservations();
    function getReservationByName();
    function getReservationByID();
    function getReservationByCheckIn();
    function getReservationByCheckOut();

    function createOneNewReservation(session = null);
    function createManyNewReservations(session = null);

    function updateReservation(session = null);

    function deleteReservation(session = null);
  }
```

  * **CurrentReservation SubClass**: Subclass of the `Reservation Class` with reference to the CurrentReservation collection based on args specified. Inherits the methods specified in its parent `Reservation Class`.

  ```javascript 
    class CurrentReservation extends Reservation {
      constructor(HotelID) {
        switch(HotelID) {
          case CurrentReservation.getLazyUID: {
            this._connection = mongoose.model('CurrentReservation Collection of Hotel 1');
            break;
          }
          case CurrentReservation.getFairValueID: {
            this._connection = mongoose.model('CurrentReservation Collection of Hotel 2');
            break;
          }
        }
      }
  }
  ```

  * **PendingReservation SubClass**: Subclass of the `Reservation Class` with reference to the PendingReservation collection based on args specified. Inherits the methods specified in its parent `Reservation Class`.

  ```javascript 
    class PendingReservation extends Reservation {
      constructor(HotelID) {
        switch(HotelID) {
          case PendingReservation.getLazyUID: {
            this._connection = mongoose.model('PendingReservation Collection of Hotel 1');
            break;
          }
          case PendingReservation.getFairValueID: {
            this._connection = mongoose.model('PendingReservation Collection of Hotel 2');
            break;
          }
        }
      }
    }
  ```

  * **DeleteReservation SubClass**: Subclass of the `Reservation Class` with reference to the DeleteReservation collection based on args specified. Inherits the methods specified in its parent `Reservation Class`.

  ```javascript 
    class DeleteReservation extends Reservation {
      constructor(HotelID) {
        switch(HotelID) {
          case DeleteReservation.getLazyUID: {
            this._connection = mongoose.model('DeleteReservation Collection of Hotel 1');
            break;
          }
          case DeleteReservation.getFairValueID: {
            this._connection = mongoose.model('DeleteReservation Collection of Hotel 2');
            break;
          }
        }
      }
    }
  ```

**Report Class**: Subclass of the Motel Object but parent to the `Maintenance` and `DailyReport`, which each reference their corresponding collections. The `Reservation Class` contins CRUD methods that operate on the documents in the respective collections but CRUD methods on subdocuments are encapsulated in the children classes.

```javascript
  class Report extends Motel {
    get getConnection() // References the mongoose model object initialized in the subclass

    //CRUD Operations on Documents
    function getReport(query); 

    function insertReport(reportObj); 
  }
```

  * **DailyReport SubClass**: Subclass of the `Report Class` and references the `DailyReport Collection` based on args specified. Inherits CRUD methods on individual documents within the collection but conatins own CRUD methods to operate on subdocuments. 

  ```javascript 
    class DailyReport extends Motel {
      constructor(HotelID) {
        super(HotelID);
        switch(HotelID) {
          case DailyReport.getLazyUID: {
            this._connection = mongoose.model('DailyReport Collection of Hotel 1');
            break;
          }
          case DailyReport.getFairValueID: {
            this._connection = mongoose.model('DailyReport Collection of Hotel 1');
            break;
          }
          default: {
            this._connection = null;
          }
        }
      }

      function updateGuestRecord(date, updatedGuestRecord, session = null);
      function updateGuestRoomRecord(date, updatedRoomRecord, session = null);
      function updateGuestHousekeepingRecord(date, updatedHouseKeepingRecord, session = null);

      function updateRefund(date, amount, notes);

      function generateDailyReport(endDate, startDate, stays);
    }
  ```

  * **Maintenance SubClass**: Subclass of the `Report Class` and references the `Maintenance Collection` based on args specified. Inherits CRUD methods on individual documents within the collection but conatins own CRUD methods to operate on subdocuments. 
  ```javascript 
    class Maintenance extends Motel {
      constructor(HotelID) {
        super(HotelID);
        switch(HotelID) {
          case Maintenance.getLazyUID: {
            this._connection = mongoose.model('Maintenance Collection of Hotel 1');
            break;
          }
          case Maintenance.getFairValueID: {
            this._connection = mongoose.model('Maintenance Collection of Hotel 1');
            break;
          }
          default: {
            this._connection = null;
          }
          
      }

      function getMaintenanceLogNames();

      function addIndividualLogEntry(name, RoomID, entry);

      function updateIndividualLogEntry(name, RoomID, LogID);

      function deleteIndividualLogEntry(name, RoomID, entry);

      function generateNewMaintenanceLog(name);
      }
  ```

**Customer Class**: Subclass of the Motel Object but parent to the `BlackList` Class. The `Customer Class` determines the SQL tables it should be interacting with upon instantiation using the `HotelID` Field. It contains CRUD methods that return SQL formatted queries to be used by the commands

```javascript 
  class Customer extends Motel {
    constructor(HotelID) {
      super(HotelID);
      this._BlackList = 'BlackList';
      switch(HotelID) {
        case Customer.getLazyUID: {
          this._IndCustomer = 'Motel1_IndCustomer';
          this._Customer = 'Motel1_Customer';
          break;
        }
        case Customer.getFairValueID: {
          this._IndCustomer = 'Motel2_IndCustomer';
          this._Customer = 'Motel2_Customer';
          break;
        }
        default: {
          this._IndCustomer = '';
          this._Customer = '';
        }
      }
    }

    function getAllCustomers(); 
    function getIndCustomerByID(BookingID);
    function getIndCustomerByFirstName(firstName);
    function getIndCustomerByCheckIn(start, end);
    function getIndCustomerByCheckOut(start, end);
    function getAllCustomersByFirstLastName(firstName, lastName);

    function addNewCustomer(CustomerData = []);
    function addNewIndCustomer(IndCustomerData = []);

    function updateCustomerByID(BookingID, data = []);
    function updateIndCustomerByID(BookingID, data = []);
  }
```

  * **BlackList Subclass**: Subclass of the `Report Class` and references the `BlackList Table`. All motels served by the API references the same BlackList so there is no need to reference different Tables based on `HotelID` field specified. This subclass contains CRUD methods that return formatted SQL queries to be used by commands

  ```javascript
    class BlackList extends Customer {
      // Inherits the Customer Constructor 

      function getBlacklistCustomerByID(BookingID);
      function getBlacklistCustomerByName(firstName);
      function addBlacklistCustomer(CustomerData = []);
      function updateBlacklistCustomer(Comments);
      function deleteBlacklistCustomerByID(BookingID);
    }
  ```

**Staff Class**: Subclass of the `Motel Class` and references the `Staff Collection` based on args specified. Contains CRUD methods to operate on Staff documents within their respective collections

```javascript
  class Staff extends Motel {
    constructor(HotelID) {
      super(HotelID);
      switch(HotelID) {
        case Staff.getLazyUID: {
          this._connection = mongoose.model('Staff for Motel 1 Collection');
          break;
        }
        case Staff.getFairValueID: {
          this._connection = mongoose.model('Staff for Motel 2 Collection');
          break;
        }
        default: {
          this._connection = null;
        }
      }
    }

    function getAllStaff();
    function findStaff(query);
    function createNewStaff(newStaffObj);
    function updateStaff(updatedStaffObj);
    function deleteStaff(username);
  }
```

**TaxReport Class**: Subclass  of the `Motel Class` and references the `DailyReport Collection` based on args specified. Generates a Tax Report based on DailyReport Documents for the specified Motel.

```javascript 
  class TaxReport extends Motel {
    constructor(HotelID, YearID, MonthID) {
      super(HotelID);
      switch(HotelID) {
        case TaxReport.getLazyUID: {
          this._connection = mongoose.model('DailyReport Collection for Motel 1');
        }
        case TaxReport.getFairValueID: {
          this._connection = mongoose.model('DailyReport Collection for Motel 2');
        }
        default: {
          this._connection = null;
        }
      }
      this._YearID;
      this.MonthID;
      this._fields; 
    }

    function downloadTaxReport(data);
    function generateTaxReport();
  }
```

## Service Layer ##
The service layer uses the Command Pattern to execute specific tasks that need to be carried out at each API endpoint or job definition. It uses a single instance of a `Conductor` to the run new instances of individual commands that define the business logic. The commands themselves instantiates instances of the `Data-Access` layer to communicate and persist data to the database. 

**Conductor**: A single instance of each running process that excutes commands. With every API request, a conductor middleware will intercept the request and obtain the HotelID and store it as an attribute. That way when it calls and runs a command, it will pass that HotelID to the commands for use. 

It uses the singleton pattern to create one instance of a conductor for each running process.
Th conductor in the future can easily add more functionality like queues of commands, histories, etc. `. 

```javascript
class Conductor {
  constructor(HotelID) {
    this._HotelID = HotelID || null;
  }

  set setHotelID(HotelID) {
    this._HotelID = HotelID;
  }

  get getHotelID() {
    return this._HotelID;
  }

  async run(command) {
    return command.execute(this._HotelID);
  }
}

module.exports = new Conductor();
```

**Commands**: Each command corresponds to a request at a specific API endpoint. It calls upon the Objects in the `Data-Access` layer to manipluate and persist against the DB based on the business logic. This encapsulates how the data is formatted and returned. 

  * **Search Commands**
    * ` SearchReservationsByFirstName(firstName) `
    * ` SearchReservationsByBookingID(BookingID) `
    * ` SearchReservationsByCheckIn(start, end) `
    * ` SearchReservationsByCheckOut(start, end) `

    * ` SearchDelResByFirstName(firstName) `
    * ` SearchDelResByBookingID(BookingID) `
    * ` SearchDelResByCheckIn(start, end) `
    * ` SearchDelResByCheckOut(start, end) `

    * ` SearchCustomersByFirstName(firstName) `
    * ` SearchCustomersByBookingID(BookingID) `
    * ` SearchCustomersByCheckIn(start, end) `
    * ` SearchCustomersByCheckOut(start, end) `

    * ` SearchBlackListByFirstName(firstName) `
    * ` SearchBlackListByBookingID(BookingID) `

  * **Reservation Commmands**
    * ` CreatePendRes(newResObj) `
    * ` UpdatePendRes(updateResObj) `
    * ` UpdatePendToCurrRes(updateResObj) `
    * ` DeletePendRes(BookingID) `

    * ` SearchAllCurrRes() `
    * ` CreateCurrRes(newResObj) `
    * ` UpdateCurrRes(updateResObj) `
    * ` UpdateCurrToPendRes(updateResObj) `
    * ` UpdateCurrToArrivals(updateResObj) `
    * ` CheckInCurrRes(updateResObj) `
    * ` DeleteCurrRes(BookingID) `

    * ` UpdateDelRes(updateResObj) `
    * ` DeleteDelRes(BookingID) `

  * **DailyReport Commands**
    * ` SearchDailyReport(date) `
    * ` UpdateDailyReportRoomRecord(date, newRoomRecord) `
    * ` DeleteDailyReportRoomRecord(date, RoomID) ` (NOT IN USE)

    * ` UpdateDailyReportRefund(date, amount, notes) `

    * ` UpdateDailyReportHousekeepingRecord(date, newHouseKeepingRecord)`

    * ` GenerateTaxReport(MonthID, YearID) `
  
  * **Maintenance Commands** 
    * ` SearchMaintenanceLogByName(name) `
    * ` SearchAllMaintenanceLogNames() `
    * ` GenerateNewMaintenanceLog(name) `
    * ` DeleteMaintenanceLogByName(name) `

    * ` CreateMaintenanceEntry(name, field, newEntry) `
    * ` UpdateMaintenanceEntry(name, field, updatedEntry) `
    * ` DeleteMaintenanceEntry(name, field, EntryID) `

  * **Customer Commands** 
    * ` CreateNewCustomer(newCustObj, roomType) `
    * ` UpdateCustomer(updatedCustObj) `

  * **BlackList Commands** 
    * ` CreateNewBlackListCust(BookingID, Comments) `
    * ` UpdateBlackListCust(Comments) `
    * ` DeleteBlackListCust(BookingID) `

  * **Staff Commands** 
    * ` SearchAllStaff() `
    * ` AddNewStaff(newStaffObj) `
    * ` UpdateStaff(updatedStaffObj) `
    * ` DeleteStaff(username) `

    
## Controller Layer ##
The controller layer defines all the API routes and middlewares. Each API endpoint simply corresponds to set of data validation/format middlewares and a command that is run by the conductor to return a respond or pass an error to the error middleware. Below is the template for each endpoint.

```javascript
  router
    .route('/')
    .put(ValidateReq, async (req, res, next) => {
      const { date } = req.query;

      return Conductor.run(
        new Command(args)
      )
        .then((result) => {
          return res.send(result);
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.status = 400;
          return next(error);
        });
    });
```

Below is a list of all the API endpoints: 

  * **Auth Routes** 
    * `POST /api/user/login`
    * `GET /apl/user/logout` 
  
  * **Report Routes**
    * `GET: /api/dailyreport?HotelID=?date=?`
    * `PUT: /api/dailyreport?HotelID=?date=?`

    * `PUT: /api/dailyreport/refund?HotelID=?`
    * `PUT: /api/dailyreport/housekeeping?HotelID=?&date=?`
    * `GET: /api/dailyreport/tax?HotelID=?MonthID=?YearID=?`

  * **BlackList Routes**
    * `POST: /api/blacklist?HotelID=?`
    * `PUT: /api/blacklist?HotelID=?`
    * `DELETE: /api/blacklist?HotelID=?&BookingID=?`

  * **Customer Routes**
    * `POST: /api/customer?HotelID=?&roomType=?`
    * `PUT: /api/customer?HotelID=?` 

  * **Maintenance Routes**
    * `GET: /api/maintenance?HotelID=?&name=?`
    * `POST: /api/maintenance?HotelID=?&name=?`
    * `DELETE: /api/maintenance?HotelID=?&name=?`

    * `POST: /api/maintenance/logEntry?HotelID=?&name=?&field=?`
    * `PUT: /api/maintenance/logEntry?HotelID=?&name=?&field=?`
    * `DELETE: /api/maintenance/logEntry?HotelID=?&name=?&field=?&entryID=?`

  * **Reservation Routes**
    * `POST: /api/reservation/PendingReservation?HotelID=?`
    * `PUT: /api/reservation/PendingReservation?HotelID=?dateChange=?`
    * `DELETE: /reservation/api/PendingReservation?HotelID=?&BookingID=?`

    * `GET: /api/reservation/CurrentReservation?HotelID=?`
    * `POST: /api/reservation/CurrentReservation?HotelID=?&roomType=?`
    * `PUT: /api/reservation/CurrentReservation?HotelID=?&dateChange=?&checkIn=?&moveToArr=?&roomType=?`
    * `DELETE: /api/reservation/CurrentReservation?HotelID=?&BookingID=?`

    * `PUT: /api/reservation/delreservations?HotelID=?`
    * `DELETE: /api/reservation/delreservations?HotelID=?&BookingID=?`

  * **Search Routes**
    * `GET: /api/search/${collection_name}/firstName?HotelID=?&firstName=?`
    * `GET: /api/search/${collection_name}/BookingID?HotelID=?&BookingID=?`
    * `GET: /api/search/${collection_name}/checkIn?HotelID=?&start=?&end=?`
    * `GET /api/search/${collection_name}/checkOut?HotelID=?&start=?&end=?`
  
  * **Staff Routes**
    * `GET: /api/staff?HotelID=?`
    * `POST: /api/staff?HotelID=?`
    * `PUT: /api/staff?HotelID=?`
    * `DELETE: /api/staff?HotelID=?&username=?`





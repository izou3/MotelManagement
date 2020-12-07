<div align="center">
<img src="https://user-images.githubusercontent.com/55326650/98072762-c8260680-1e34-11eb-93d7-224da3deb08d.jpg" align="center" width="35% alt="Project icon">

# Hotel Management System

</div>

This project is a landing page (website) and management system for small-scale hotel operations with ability to manage/track revenue in short-term and long-term stays, email reservation confirmation, generate tax reports/revenue, as well as track housekeeping operations and maintenance logs for multiple motels with more features to come in the future! 

It is built as a full-stack javascript application and deployed to Digital Ocean Kubernetes with static files served from DigitalOcean Spaces. See below for [infrastructure](#Infrastructure).
  - **Frontend-Hotel Website**: SSR App Boilerplated with RazzleJS and Styled with MaterialUI 
  - **Frontend-Management System**: React-Redux App Styled with MaterialUI, 
  - **Backend-API**: Express-Node API Server with JWT Authentication
  - **Backend-Jobs**: Repeating Jobs and an Email Messaging Queue using AgendaJS and Agendash
  - **Database** MySQL DB on DigitalOcean Managed DB and MongoDB on MongoAtlas

<div align="center">
<img src="https://user-images.githubusercontent.com/55326650/98072588-5b127100-1e34-11eb-94ab-e472a2abce6a.gif"  width="80%" height="80%">
<img src="https://user-images.githubusercontent.com/55326650/98072733-b3497300-1e34-11eb-996c-c5f488329a8e.JPG">

##### **Website Live At [www.bigskylodge.com](https://www.bigskylodge.com)**

</div>

# Getting Started 
To run the application in your local environment, there are four different servers in development mode that can be run concurrently for full exposure to the application. 

#### Backend and Database Setup:

1. Install Backend Dependencies
```bash
cd backend
npm install
```

2. Create a new database cluster using [Mongo Atlas:](https://docs.atlas.mongodb.com/getting-started/)

3. Create a Staff collection in your Mongo Database and insert the following document
```bash 
"email":"${YOUR_EMAIL}"
"position": 0
"username":"ivanzou"
"firstName":"Ivan"
"lastName":"Zou"
"hashPassword":"$2b$10$LH3jmEAVCED5ZJPRv.cSTOsQ1bIAD2tJOtefjVHWj9pE6ev0WXYsC"
```

4. Run Sequlize Migration and Seed files `npm run migrateToDev` and `npm run seedToDev`

5. Edit `.env` located in the backend root directory with appropriate variables and save
> If you don't want to have the email messaging queue running as part of the app, you don't have to fill those Google OAUTH fields but if you do, you can either enter your existing info or obtain them from this [tutorial](#https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1)

`npm start` Starts API-Server on localhost:3001

`npm run agenda` Starts AgendaJS Server on localhost:3002

#### Frontend: Management System Setup

1. Install Frontend Dependencies
```bash
cd frontend/webapp
npm install
```
2. `npm start` To start development server on localhost:3000/staff

3. Login with
```bash
username: ivanzou
password: test1234
```

#### Frontend: Landing Page Setup

1. Install Frontend Dependencies
```bash
cd frontend/landing
npm install
```

2. `npm start` To start development server on localhost:3000

#### The application runs on 4 ports. 
Note that you must run one or the either of the landing or management system frontend as both are hosted on PORT:3000

- http://localhost:3000/ - landing page
- http://localhost:3000/staff - management system
- http://localhost:3001/user - all authentication requests
- http://localhost:3001/api - all api requests 
- http://localhost:3002/dash - background jobs dashboard

# Documentation
## Table of Contents
1. [Infrastructure](#Infrastructure)
2. [Frontend-Website](#Landing-Page)
3. [Frontend-Management System](#Management-System)
4. [Backend-API](#Backend-API)
5. [Backend-Jobs](#Backend-Jobs)
6. [MySQL Database Schema](#MySQL-Database-Schema)
7. [MongoDB Database Schema](#MongoDB-Database-Schema)
8. [Development](#Development)
9. [Testing](#Testing)
10. [Debugging](#Debugging)
11. [Deployment](#Deployment)
12. [Future Features and Issues](#Future-Features-and-Issues)
13. [Credits](#Credit)

<a name="Infrastructure"/>

## Infrastructure

<div align="center">
<img src="https://user-images.githubusercontent.com/55326650/98457410-f406fc00-2154-11eb-839a-ce459b4b4577.JPG"  width="80%" height="80%">
</div>

Above is the infrastructure of the entire application based on a microservice architecture. There are currently 4 microservices which the potential and ease to add new services to the application. 
  - Frontend Website Service
  - Frontend Management System Service
  - Backend API Service
  - Background Processing Service 

The main application logic is deployed to DigitalOcean Kubernetes for a resilent and scalable platform. The IP address of each  kubernetes nodes are whitelisted on the corresponding database servers for secure communication. 

The kubernetes cluster is exposed with a public IP address using the NGINX Ingress Controller, which acts as a reverse-proxy to send users to the appropriate service. 

The public IP address of the NGINX Controller is mapped to two DNS A records with HTTPS protocol.

Static contents such as images, fonts, and javascript files are served from DigitalOcean Spaces CDN for fast delivery.

<a name="Landing-Page"/>

## Landing Page

The hotel website is a universial javascript application bootstrapped with [RazzleJS](#https://razzlejs.org/getting-started) and styled with [MaterialUI](#https://material-ui.com/). It consists of five pages that detail the hotel's information and local area guides. 
 - **Home**: Main hotel page with description, photos, and some recent reviews
 - **Accomodations**: The types of rooms and amenities available at the hotel as well as policies
 - **Attractions**: Local area tourists spots and guides
 - **Location** Google Maps API to display a google map of the location of the hotel
 - **Reservation** iframe from a booking engine that redirects to your reservation portal

 #### Future Features
 - **Booking Engine**: a booking engine that takes in reservations, stores credit card information securely, and connects to the management system 


<a name="Management-System"/>

## Management System

The management system is a [react-redux](#https://react-redux.js.org/) single page application bootstrapped with [create-react-app](#https://github.com/facebook/create-react-app). It proxies requests to an [API backend server](#Backend-API) for database persistence and is authenticated using jwt-tokens signed from the backend. It is also able to serve multiple hotels based on Login credentials.

React-components are organized into the `/pages` and `/components` directory and redux files in the `/redux` 

*Pages Directory*: Holds stateful components that are connected to the redux store. Each component is a feature of the application
  - Home Dashboard 
  - Search/Query
  - Daily Report 
  - Maintenance Log 
  - Housekeeping Sheet 
  - Tax Report
  - Staff

*Component Directory*: Holds stateless or local state components (not connected to the redux store) that are reused multiple times by components in the *Pages Directory*
   - Regular Table 
   - Page Table 
   - Form 
   - Full Page Loader
   - Navigation Bar
   - Private Route

This app utlizes the following open-source projects/resources for display and manipulation of data: 
   - [MomentJS](#https://momentjs.com/)
   - [Axios](#https://github.com/axios/axios)
   - [js-file-download](#https://www.npmjs.com/package/js-file-download)
   - [Formik](#https://formik.org/)
   - [Formik-Material-UI](#https://github.com/stackworx/formik-material-ui)
   - [Material-Table](#https://material-table.com/#/)

---
### How the system handles multiple Hotel Systems
---

The frontend systems currently serves two Hotels specified in the backend but uses the same interface to serve the Hotels. API requests are differentiated with a HotelID query parameter and the hotel room numbers are determine by an array that the backend sends upon login. This array is stored in the redux state and is used to display the hotel numbers on the frontend for users to interact with. 

---
### How Reservations are tracked, displayed, and stored
---

Reservations for the hotel are stored in 3 different collections in the MongoDB. Each for holding different kinds of reservations. 

The frontend UI allows authenticated and authorized users to perform CRUD operations on these collections.

#### Current Reservation Collection
***
This collection is in charge of storing guests who have checked in, guests who will check in within 48 hours (Cancellation Period), or guests who have not checked in. The `checked` field of reservation documents in this collection indicate which group they're in

```bash
checked = 0   Guests who have not checked in and have not yet been deleted
checked = 1   Guests who have checked into their rooms
checked = 2   Guests who will check in within 48 hours of the current day
```

Based on this field, the reservation documents are grouped in their corresponding tables of the **Main Dashboard Page**. As a user, you're given flexibility to move reservations back and forth between these three tables depending on reservation's circumstances as well as updating or creating these reservations. 

Howvever we do enforce validations such as not allowing a reservation to be checked-in to an occupied room or updating a checked-in guest into an occupied rooms.

As part of the initial load and every subsequent refresh, these reservations from fetched from the backend api server and sorted to the three different tables on the **Main Dashboard Page** based on their `checked` field.

The data for this collection is stored in the **currRes state**

#### Pending Reservation Collection 
***
This collection stores reservations beyond 48-hours of the current day. A background job that executes every 4am MT will move reservations within 48-hours of the current day from **Pending Collection** into **Current Collection**. 

This collection has the following operations: 
  - Newly Created Reservations beyond 48-hours of the current day are stored in **Pending Reservation Collection**
  - If reservations stored in the **Pending Reservation Collection** are updated so that their `checkIn` date is within 48-hours of the current day, they're then moved into **Current Reservation Collection**
  - If reservations in the **Current Collection** who are not yet checked in are updated so that their `checkIn` is beyond 48-hours of the current day, they're then moved into the **Pending Reservation Collection**

The data for this collection is stored in the **pendRes State**

#### Delete Reservation Collection
***
This collection stores reservations that have been deleted or cancelled. **NOTE that all reservations must go through here before they are deleted from the database**  

The data for this collection is stored in the **deleteRes State**

---
### Checked Out Guests and Blacklists 
---

Reservations who have checked out are known as **customers** and their reservation data is stored in the MySQL database accordingly. The purpose for storing them in a separate database is due to storage capacity of the database services, fixed data structure, and higher use of transactions for data manipulation. See [below](##MySQL-Database Schema) for how these data are organized and stored and the [process](#Backend-API) of how they're moved from MongoDB to MySQL DB. 

Guests who have checked-out can also be added and removed from a Blacklists table in the MySQL DB. 

All update operations on customers and blacklists are performed in the **Search Page** of the management system. From there, a user can update and delete customers as well as add and remove them from the blacklists. 

---
### Querying Reservations, Customers (Checked-Out Guest), and Blacklists
---
The **Search Page** allows users to query reservations or customers and perform operations on them. 

Currently, a user can search for *Reservations*, *Deleted Reservations*, *Customers*, and *Blacklists* based on: 
  - BookingID
  - First Name
  - Check In Date Range
  - Check Out Date Range

*How Search and Form Display Works*

The searchResult state consists of the following with default values: 
```javascript 
searchType: 'none'   // Specifies what table or collection should be queried. [Customer, Pending/Delete Reservation Collection, Blacklists]
results: []          // The array of reservation/customer objects returned from the API request
```

The form state consists of the following with default value: 
```javascript 
  open: false,    // Whether the form is displayed or not
  list: 0,        // Which type of form should be rendered. See Code Comment for complete list
  data: {},       // The data the form should be rendering
```

1. After a user enters an input value or a date range, select the method they're searching by and what they're searching for, they hit submit

2. On submit, an action is dispached to change the `searchType` field to either customer, pending, delete, or blacklist

3. Using that information, a corresponding thunk with an api endpoint is then dispatched on the specified collection/table based on whether the user is searching by BookingID, firstName, CheckIn Period, or CheckOut Period

4. The resulting data after hitting the endpoint is then dispatched to an action that sets the `results` array of the *searchResult State* to the returned data

5. If the user clicks on icon button of data record, a form is then displayed of the data. 

6. Based on the `searchType` field of the *searchResult State*, the corresponding form will render as well as the corresponding action buttons. See below for detail of how action buttons are implemented.

---
### Daily Reports 
---
The DailyReport is a collection in the MongoDB which stores housekeeping information as well as occupancy information. The main purpose of this collection is to track longer-term stays that are common for the motel in the offseaon (weekly, monthly) as well as maintain a strong idea of the current revenue and generating tax reports on the fly. 

This collection *MUST* be in sync with the **Current Reservation Collection** and it uses transactions to ensure that operations performed on reservations in **Current Reservation Collection** are also performed on records in the DailyReport and vice versa. 

This collection is reflected in the **Daily Report Page** and data is displayed and can be manipluated for each room on the following attributes
  - Payment type (Card/Cash)
  - Type of Stay (Nightly, StayOver, Weekly, Monthly)
  - Notes of the Stay
  - Initial of employee who recieved the guest's payment

Users can also search for DailyReports from previous dates but cannot update records that have checked out

---
### Generating Tax Reports
---
This feature is just a page in the app where users can enter a month and a year and a corresponding csv file will be downloaded in the user's browser. 

The trick here is that the tax report can be generated during any time of the month (perferably in the end of the month) because it is generated from the number of Daily Report Records present in the **DailyReport Collection* with matching month and year. As a result, a user can track the progress throughout the month

The logic of generating tax reports uses the Mongo Aggregation Framework documented below

---
### Maintenance Log 
---
Similiar to the Daily Report, the maintenance log has a record for each room of the property as well as array for each room to add, update, or delete maintenance entries. 

A user can also create new maintenance logs such as logs to track air conditioner cleaning, deep cleaning of rooms, etc. 

---
### Housekeeping Sheet
---
This record shares a collection with the **DailyReport Collection** and tracks housekeeping each day of the year.

The data is displayed for each room and can be manipluated based on the following attributes: 
  - Room Type: (Summer Sheets and Towels/Winter Sheets and Towels)
  - Occupancy: (Ready, Occupied, Clean)
  - Name of Housekeeping assigned to room
  - Notes of the Stay

---
### Staff, Authorization, and Authentication
---
The **Staff Page** tracks the user accounts who have access to the management system. Authroized users can add, update, and delete employees from that list.

Once a employee logins, their jwt token will expire 60 minutes from the time it is signed. After that 60 minutes is up, any subsequent dispatch will logout the user and require a login for a new token. More details of this can be found below in challenges.

Along with this, before any disptach of thunks/API requests, a request is made to the server to check for the existence of any httpOnly cookies that may have been cleared from the browser tab:
```javascript 
    axios.get('/validAccess')
    .catch(() => {
      return dispatch(
        batchActions([
          logoutUser(),
          snackBarSuccess('UnAuthorized Access')
        ])
      );
    });
  ```
  
After this request is a conditon to check for the **authState** which will prevent any subsequent statements from being executed if a logout has been dispatched from either the `checkTokenExpiration Middleware` or the previous request for the existence of httpOnly cookies:
```javascript
  const state = getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }
```


The management system also takes into consideration the authorization of each user based on the `position` field 
```javascript 
position field: 
0 = Owners
1 = Managers
3 = Housekeepers
```

**Future Issues to Resolve:**
1. When a user is automatically logged out after their token has expired, when they log back in, prevent the initial page load and preserve their state so they can leave right where they left off.
2. Set a duration so that if a user is inactive for a specified time, app will log itself out. 

*How Authorization Works* 
To limit access of certain pages of the app, a `<PrivateRoute>` component is wrapped around each page of the app to restrict both unautenticated users and unauthroized staff. 

1. When a staff logins in, their jwt token is decoded and their name, position, and authentication status is stored in the *staffState* state

2. An access prop is passed to each `<PrivateRoute>` component which is an array containing the positions (0,1,2) that have access to the page that the `<PrivateRoute>` is parent of

```bash
          <PrivateRoute
            exact
            path="/staff/"
            component={Home}
            auth={auth}
            access={[0, 1]} 
          />
```

3. When a staff tries to access each page, `<PrivateRoute>` checks whether that staff's position if part of the access array prop and redirects if the position is not part of of the array

```bash
    <Route
      {...rest}
      render={(props) =>
        auth.isAuthenticated === true && access.includes(auth.user.position) ? (
          <Component {...props} />
        ) : (
          <Redirect to="/staff/login" />
        )
      }
    />
```

Also note that the navigation bar displays accordingly based on the position of the staff that has logged in

---
### Challenges
---

1. One of the challenge that I faced coding up the frontend was displaying and executing different action buttons for the different types of form that were rendered while reusing the same component.

For example, when rendering the form with data for a reservation in the *Current Reservation Collection* that has field `checked=2` the form needed 3 different action buttons of `Update`, `Check-In`, and `Delete`. That same form had to be reused again for creating a new reservation with empty fields that only required 1 action button of `New Reservation`

I first defined a `<MyForm>` component as a stateless reusable component for others to use. 

When a component renders a form, it can pass in a maximum of 3 actions (doesn't have to pass in all three) which will dispatch thunks accordingly. It'll also pass in data for the form to render, type of form, and whether it display the form or not

```javascript 
 const formAction2 = (dataRes) => {
    if (formType === 1) {
      logger('check out guest');
      checkOutReservation(dataRes);
    } else if (formType === 2) {
      logger('check in guest');
      checkInReservation(dataRes);
    } else if (formType === 3) {
      logger('delete reservation');
      deleteCurrentReservation(dataRes.BookingID);
    } else {
      logger('no action');
    }
  };

  <MyForm
    open={formOpen}
    data={formData}
    type={formType}
    handleClose={closeForm2}
    action1={formAction1}
    action2={formAction2}
    action3={formAction3}
  />
```

In my `Form.js` file which defined the `<MyForm>` component, I first used tenary operators to render different Formik Forms based on type of form from the *form state*. 

The `<MyForm>` component also has an `actionType` local state to determine which action button was clicked and `handleSubmit()` to set the state accordingly

```javascript 
  const [actionType, setActionType] = React.useState('none');

  const handleSubmit = (formType, submitHandler) => {
    if (formType === 'action1') {
      setActionType('action1');
    } else if (formType === 'action2') {
      setActionType('action2');
    } else if (formType === 'action3') {
      setActionType('action3');
    } else {
      setActionType('none'); // default action type
    }
    submitHandler();
  };
```

Then, in the onSubmit props of the `Formik` component, it would call the corresponding actions passed down from the parent based on the `actionType` local state of the `<MyForm>` component

```javascript 
  if (actionType === 'action1') {
    props.action1(
      {
        ...data,
        ...values,
      },
      data.RoomID
    );
  } else if (actionType === 'action2') {
    props.action2({
      ...data,
      ...values,
    });
  } else if (actionType === 'action3') {
    props.action3(
      {
        ...data,
        ...values,
      },
      data.RoomID
    );
  }
```

All forms had a common `<FormActions>` component which displays the different action buttons based on the form type. 
```javascript 
  <FormActions
    submitForm={submitForm}
    handleForm={handleSubmit}
    isSubmitting={isSubmitting}
    type={type}
  />
```

In the `<FormActions>` component, it'll set different names of button depending on form type and render only buttons that need to be rendered as well as their appropriate name: 
```javascript
  if (type === 0) {
    button1 = 'New Reservation';
    button2 = '';
    button3 = '';
    hidden1 = '';
    hidden2 = 'none';
    hidden3 = 'none';
  } 

  <>
    <Box display={hidden1}>
      <Button
        variant="contained"
        color="primary"
        value="button1"
        disabled={isSubmitting}
        onClick={() => props.handleForm('action1', props.submitForm)}
      >
        {button1}
      </Button>
    </Box>
    <Box display={hidden2}>
      <Button
        variant="contained"
        color="primary"
        value="button2"
        disabled={isSubmitting}
        onClick={() => props.handleForm('action2', props.submitForm)}
      >
        {button2}
      </Button>
    </Box>
    <Box display={hidden3}>
      <Button
        variant="contained"
        value="button3"
        color="primary"
        disabled={isSubmitting}
        onClick={() => props.handleForm('action3', props.submitForm)}
      >
        {button3}
      </Button>
    </Box>
  </>
```
As you can see here, different buttons will render/hide based on the `formType` of the *Form State*. Each button that is pressed will trigger the `handleForm()` method from parent `<MyForm>` component with args to set the action type and submit form, which in turn will set the `actionType` local state of the `<MyForm>` component and allow the `formSubmit` prop of the `Formik` component to execute action from the parent accordingly

2. Another challenge I faced was automatically logging out the user after their jwt token expired. To solve this, I used [Redux Middlewares](#https://redux.js.org/tutorials/fundamentals/part-4-store#middleware) to check for the token expiration date before every dispatch and logout the user is that expiration date has been succeeded. 

```javascript 
const checkTokenExpirationMiddleware = (store) => (next) => (action) => {
  const authenticationState = store.getState().authState;
  if (
    authenticationState.isAuthenticated &&
    authenticationState.expire < Date.now() / 1000
  ) {
    next({ type: 'LOGOUT_USER' });
    next(snackBarSuccess('Session Timeout! Login Again!'));
  } else {
    next(action);
  }
};

applyMiddleware(checkTokenExpirationMiddleware, thunk)
```


<a name="Backend-API"/>

## Backend API
> For more detail on backend, please see the `README` located in the backend directory. 

The backend api server serves as a gateway between the frontend and the database, manipluating data through transaction queries and mongo aggregations to return the desired result that the frontend requests. Because the backend server has to be able to serve different hotels each with different room numbers and their own reservations, a `HotelID` query string is used to differentiate API requests. 

All backend api requests go through `/api` route where an express router autenticates the request and sends the it to the matching router. A hotel check middleware also intercepts the request, obtains the `HotelID` of the request and stores it in a Conductor for it to use to run commands. 

All login requests go through `/user` route where an express router directs login and logout requests to their matching router.

This app makes use of the following modules: 
  - *[ExpressJS](#https://expressjs.com/)* Middleware: for API routering and server side rendering.
  - *[jsonwebtoken](#https://github.com/auth0/node-jsonwebtoken)*: for securing APIs in http-only cookies
  - *[mysql2 driver](#https://github.com/sidorares/node-mysql2)*: for accessing  and writing to MySQL DB with Promise support
  - *[mongoose driver](#https://mongoosejs.com/)*: for accessing and writing to MongoDB 
  - *[morgan](#https://github.com/expressjs/morgan) and [winston](#https://github.com/winstonjs/winston)* for logging
  - *[sequelize for MySQL](#https://sequelize.org/)*: for running migration and seed files
  - *[nodemailer](#https://nodemailer.com/about/)*: for sending reservation confirmation emails with gmail


The backend is currently encapsulated into three layers of logic
  * Controller: handles all API routes
  * Services: business logic
  * Date-Access: queries and DB connections for corresponding motels

<div align="center">
<img src="https://user-images.githubusercontent.com/55326650/101309870-608c1e00-381b-11eb-8303-6c6032fb1faf.JPG"  width="80%" height="80%">
</div>

---
### Authentication Service (MongoDB)
---
This service is in charge of maintaining the *Staff Collection* which consists of all the employee who are authorized to the use application as well as logging users in and out and securing API endpoints

The authentication service has the following methods that *DO NOT* require an authentication middleware: 
  - `loginRequired()`: Executes the subsequent middleware if `req.user` is defined. Else throw a 401 Error
  - `login()`: Signs a jwt token with staff data and sends the token to the client as httpOnly cookie if username and password matches a document in Staff Collection.
  - `logout()`: clears the token httpOnly cookie 

The authentication service has the following methods that *DO* require an authentication middleware: 
  -`getAllStaff()`: returns all the authorizied users in stored in the Staff Collection
  -`register()`: creates a new new staff document in the Staff Collection
  -`updateStaff()`: updates a staff in the Staff Collection
  -`deleteStaff()`: deletes a staff in the Staff Collection

**How Authentication Works**
The authentication strategy used by this app is a pretty straightforward and simple one. 

1. Users makes a request to the backend
2. An authentication middleware first checks for a jwt-token in the cookies. 
  - If it exists, decode it, assign it to `req.user` and move onto the next middleware. 
  - Else assign `req.user = null` and move onto the next middleware

```javascript 
  app.use((req, res, next) => {
    const { token } = req.cookies;

    try {
      if (!token) throw new Error('Undefined Token');
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded;
    } catch (err) {
      req.user = undefined;
    } finally {
      next();
    }
  });
```
3. If request is though `/api`, request must go through `loginRequired` middleware to check for the authorization of the request based on the definition of `req.user`, which was asigned in the previous middleware

```javascript
  loginRequired: (req, res, next) => {
    if (req.user) {
      return next();
    }
    // 401 Error
    const error = new Error('Unauthorized User');
    error.status = 401;
    res.status(401);
    return next(error);
  },
```

4. If `req.user` is defined, move onto the next middleware which defines the api endpoints. Else direct to the express error middleware. 

---
### Customer Service (MySQL)
---
This service is in charge of CRUD and cross-database queries to MySQL database. 

**Search Queries**
Queries against the customers stored in the tables of the MySQL DB to join their attributes together in order to from a complete customer object. These queries all use INNER JOINS and are searched by checkIn or checkOut period, BookingID, and FirstName attributes. 

**Create Query - addNewCustomer()**
This is a cross database transaction query that removes reservations stored in the *Current Reservation Collection* of the MongoDB and adds them to two tables (Customer and IndCustomer) in the MySQL DB. 

  1. Add part of the reservation data to Customer Table in MySQL
  2. Add the remaining data of the reservation to IndCustomer table in MySQL 
  3. Delete the reservation record from DailyReport document for that day 
  4. Delete the reservation record from Current Reservation Collection 

*If any of the above steps fail, the whole process is aborted and the DB go back to their original states*

**Update Query**
This is just a transactional query that adds part of the updated data to **Customer Table** and the remaining data to the **IndCustomer Table** both in MySQL 

---
### Blacklist Service (MySQL)
---
This is a basic service that allows customers in the MySQL DB to have their `BookingID` field added to a Blacklist table in MySQL as well as removed from. Users can also edit a `comment` field for the Blacklisted Customer.

---
### Current Reservation Service (MongoDB)
---
This service is in charge of allowing the frontend to interact with the **Current Reservation and Daily Report Collections** 

**Search Queries**
Methods to search the **Current Reservation Collection** by BookingID, FirstName, checkIn/checkOut period

**CRUD Queries**
Since the **Current Reservation Collection** MUST be in sync with the **Daily Report Collection**, all CRUD operations on records in the **Current Reservation Collection** with field `checked==1` are transaction queries that apply the changes to both the **Current Reservation and Daily Report Collections**

---
### Pending Reservation Service (MongoDB)
---
This service is in charge of allowing the frontend to interact with the **Pending Reservation Collection** 

**Search Queries**
Methods to search the **Pending Reservation Collection** by BookingID, FirstName, checkIn/checkOut period

**CRUD Queries**
Methods to create, update, read, or delete reservations from the **Pending Reservation Collection**

---
### Delete Reservation Service (MongoDB)
---
This service is in charge of allowing the frontend to interact with the **Delete Reservation Collection** 

**Search Queries**
Methods to search the **Delete Reservation Collection** by BookingID, FirstName, checkIn/checkOut period

**CRUD Queries**
Methods to create, update, read, or delete reservations from the **Delete Reservation Collection**

---
### DailyReport Service (MongoDB)
---
This service contains two primary methods for interaction with the **DailyReport Collection**

**updateGuestRecord()**
A transaction query that updates reservation records in **DailyReport Collection** as well as its corresponding record in the **Current Reservation Collection**

**generateDailyReport()**
This query is used by the background processing job. Its purpose is to generate a a new Daily Report document for the given day based on the previous day's Daily Report Document. It loops though 26 rooms of the motel and generates a reservation and housekeeping record for each based on three conditions 

  - Guest exists and is not yet due 
  - Guest exists and is due today (can choose to extend stay of check out. This is change is made in updateGuestRecord())
  - Guest does not exist

---
### Maintenance Log Service (MongoDB)
---
Service to add and delete new maintenace logs to the **Maintenace Log Collection** as well as add, update, and delete entries for each room of a specific maintenacen log. 

---
### Housekeeping Sheet Service (MongoDB)
---
Shares data with the **DailyReport Collection** with just one method to just update housekeeping entry for a specified room for a housekeeping sheet on a specified date.

---
### Tax Report Service (Mongo Aggregation)
---
This service is in charge of genrating a tax report using the documents in the **DailyReport Collection**. The tax report is stored anywhere in the database so it'll need to be generated with every request. To do this, it takes advantage of the mongo aggregation framework using a 12 stage pipeline to generate an array of object that has records for every day of the month and a final record of total and averages. This array is then parsed into a csv object that is send to the frontend for the user to download. 

<div align="center">
<img src="https://user-images.githubusercontent.com/55326650/98072806-e68c0200-1e34-11eb-9fe7-4aec69b8ab77.JPG"  width="80%" height="80%">

*This is only an example tax report with Daily Report records for the following date. A real-world one would contain all the dates of the month*

</div> 

The general flow of the aggregation pipeline first identifies the DailyReport Collection's Document by the month and year. After it filters out unneccessary data, unwinds individual room records and groups them back together as well as adding new necessary fields for the tax report. The process is described in details below.

1. Matches necessary DailyReport documents for the month of tax report to generate
```bash
  $match: {
    YearID: Number(this.year),
    MonthID: Number(this.month),
  },
```

2. Projects neccessary fields and turns `Stays` object into an array
```bash 
  $project: {
    _id: 0,
    Date: '$Date',
    Refund: '$Refund',
    YearID: '$YearID',
    MonthID: '$MonthID',
    Stays: {
      $objectToArray: '$Stays',
    },
  },
```    

3. Filters out the housekeeping record for room, only requiring the reservation record
```bash
  $project: {
    Date: '$Date',
    YearID: '$YearID',
    MonthID: '$MonthID',
    Refund: '$Refund.Amount',
    Stays: '$Stays.v.Room',
  },
```

4. Only require records that are not empty or due to stayover and haven't yet paid
```bash
  $project: {
    Date: '$Date',
    YearID: '$YearID',
    MonthID: '$MonthID',
    Refund: '$Refund',
    Stays: {
      $filter: {
        input: '$Stays',
        as: 'room',
        cond: {
          $eq: ['$$room.paid', true],
        },
      },
    },
```
5. Unwind all documents in the `Stays` array
```bash
  $unwind: {
    path: '$Stays',
    includeArrayIndex: 'stayOfDate',
    preserveNullAndEmptyArrays: true,
  },
```

6. For each document (reservation record of each room each day for the month), project out their attributes 
```bash
$project: {
  Date: '$Date',
  YearID: '$YearID',
  MonthID: '$MonthID',
  Refund: '$Refund',
  StayOfDate: {
    $cond: {
      if: {
        $eq: ['$stayOfDate', null],
      },
      then: -1,
      else: '$stayOfDate',
    },
  },
  StayOver: {
    $cond: {
      if: {
        $or: [
          {
            $eq: ['$Stays.type', 'N'],
          },
          {
            $eq: ['$Stays.type', 'S/O'],
          },
        ],
      },
      then: 1,
      else: 0,
    },
  },
  Weekly: {
    $cond: {
      if: {
        $or: [
          {
            $eq: ['$Stays.type', 'WK1'],
          },
          {
            $eq: ['$Stays.type', 'WK2'],
          },
          {
            $eq: ['$Stays.type', 'WK3'],
          },
        ],
      },
      then: 1,
      else: 0,
    },
  },
  NoTaxStay: {
    $cond: {
      if: {
        $eq: ['$Stays.type', 'NO'],
      },
      then: 1,
      else: 0,
    },
  },
  PaymentType: '$Stays.payment',
  PaymentNet: {
    $subtract: ['$Stays.rate', '$Stays.tax'],
  },
  PaymentTax: '$Stays.tax',
  PaymentGross: '$Stays.rate',
  GrossNoTax: {
    $cond: {
      if: {
        $eq: ['$Stays.type', 'NO'],
      },
      then: '$Stays.rate',
      else: 0,
    },
  },
}
```

7. Group all documents (reservation record of each room each day for the month) by their date and payment method and sum up their earnings and number of stay types. By the end of this stage, there should be two documents for every date with each document has the earnings for their payment type. 

*For instance: if there is 30 DailyReport Documents for a month, there would now at this stage be 60 documents with 30 documents containing earnings for those 30 days in cash and the other 30 documents with earnings in card*
```bash
$group: {
  _id: {
    Date: '$Date',
    PaymentType: '$PaymentType',
    YearID: '$YearID',
    MonthID: '$MonthID',
    Refund: '$Refund',
  },
  StayOvers: {
    $sum: '$StayOver',
  },
  Weekly: {
    $sum: '$Weekly',
  },
  NoTaxStay: {
    $sum: '$NoTaxStay',
  },
  Net: {
    $sum: '$PaymentNet',
  },
  Tax: {
    $sum: '$PaymentTax',
  },
  Gross: {
    $sum: '$PaymentGross',
  },
  GrossNoTax: {
    $sum: '$GrossNoTax',
  },
},
```

8. Adds in the neccessary fields so that when the documents are grouped together in the next stage, we can determine the earnings for each payment type (Card/Cash) as well as their combine totel. Therefore we add some dummary variables in this stage to hold attributes that we need at the end. 
```bash
$addFields: {
  netCash: {
    $cond: {
      if: {
        $eq: ['$_id.PaymentType', 'C'],
      },
      then: {
        $round: ['$Net', 2],
      },
      else: 0,
    },
  },
  taxCash: {
    $cond: {
      if: {
        $eq: ['$_id.PaymentType', 'C'],
      },
      then: {
        $round: ['$Tax', 2],
      },
      else: 0,
    },
  },
  grossCash: {
    $cond: {
      if: {
        $eq: ['$_id.PaymentType', 'C'],
      },
      then: {
        $round: ['$Gross', 2],
      },
      else: 0,
    },
  },
  netCard: {
    $cond: {
      if: {
        $eq: ['$_id.PaymentType', 'CC'],
      },
      then: {
        $round: ['$Net', 2],
      },
      else: 0,
    },
  },
  taxCard: {
    $cond: {
      if: {
        $eq: ['$_id.PaymentType', 'CC'],
      },
      then: {
        $round: ['$Tax', 2],
      },
      else: 0,
    },
  },
  grossCard: {
    $cond: {
      if: {
        $eq: ['$_id.PaymentType', 'CC'],
      },
      then: {
        $round: ['$Gross', 2],
      },
      else: 0,
    },
  },
  grossNoTaxCash: {
    $cond: {
      if: {
        $eq: ['$_id.PaymentType', 'C'],
      },
      then: {
        $round: ['$GrossNoTax', 2],
      },
      else: 0,
    },
  },
  grossNoTaxCredit: {
    $cond: {
      if: {
        $eq: ['$_id.PaymentType', 'CC'],
      },
      then: {
        $round: ['$GrossNoTax', 2],
      },
      else: 0,
    },
  },
  
```

9. Groups the documents by combining the payment so that we now have a document for each date and half of the documents from our previous stage as well as the fields we need. 
```bash
$group: {
  _id: {
    Date: '$_id.Date',
    YearID: '$_id.YearID',
    MonthID: '$_id.MonthID',
    Refund: '$_id.Refund',
  },
  StayOver: {
    $sum: '$StayOvers',
  },
  Weekly: {
    $sum: '$Weekly',
  },
  NoTaxStay: {
    $sum: '$NoTaxStay',
  },
  NetCash: {
    $sum: '$netCash',
  },
  TaxCash: {
    $sum: '$taxCash',
  },
  GrossCash: {
    $sum: '$grossCash',
  },
  NetCard: {
    $sum: '$netCard',
  },
  TaxCard: {
    $sum: '$taxCard',
  },
  GrossCard: {
    $sum: '$grossCard',
  },
  GrossNoTaxCash: {
    $sum: '$grossNoTaxCash',
  },
  GrossNoTaxCredit: {
    $sum: '$grossNoTaxCredit',
  },
    
```
The last 4 stages simply just adds in the remaining fields we need to finish out the tax report by summing up current fields and formats the data correctly for a desired output. You can view the whole pipline under `/backend/server/services/report/TaxReport.js`

<a name="Backend-Jobs"/>

## Backend Jobs
The background processing express server runs an [AgendaJS](#https://github.com/agenda/agenda) instance on `PORT:3002` as well as [Agendash](#https://github.com/agenda/agendash) dashboard to track all the jobs located on `localhost:3002/dash`. 

The agenda instance is backed by a collection in the MongoDB where it stores job deinfitions as well as a job queue. The instance is will process the collection for jobs it has to run every 1 minute with each instance able to lock up 2 jobs at once for every process. 

```bash 
    const agenda = new Agenda()
      .processEvery('1 minute')
      .lockLimit(2)
      .mongo(connection.db, 'AgendaJobs');
```

**Current Jobs**
---
  - **GenerateDailyReport**: A repeating job that generates a new DailyReport every day at 4am MT 
  - **UpdateCurrent**: A repeating job that moves reservation checking in within 48 hours of the current day from **Pending Reservation Collecion* to *Current Reservation Collection* 
  - **ReservationConfirmation**: An email messsaging queue. Emails are produced and passed into the queue by the **API-Server** whenever a new reservation is created. The **Agenda** server instance then consumers the emails and sends them out


<a name="MySQL-Database-Schema"/>

## MySQL Database Schema
The MySQL database schema holds reservations who have checked out called *Customers*. The schema described below was designed with the intent of storing repeat customers. 

*Customer Table*: 

   | CustomerID    | YearID | MonthID | first_name | last_name | email | phone | state |
   | ------------- |:------:| :------:| :---------:| :--------:| :----:| :----:| -----:|


*IndCustomer Table (For repeat guests):*

   | BookingID     | CustomerID | price_paid | tax | check_in | check_out | num_guests | ReservationID | PaymentID | RoomID | created_at | comments  |
   | ------------- |:----------:| :---------:| :--:| :-------:| :--------:| :---------:| :------------:| :--------:| :-----:| :---------:| ---------:|
   
 *Reservation Type*            
 | ID    | Reservtion |    
 | ----- | ----------:|    
 |   0   |   Walk-In  |
 |   1   | Phone-Call |
 |   2   |   Booking  |
 |   3   |   Expedia  |
 |   4   |   AirBnB   |
 |   5   |    Other   |
 
  *Payment Type*            
 | ID    | Reservtion |    
 | ----- | ----------:|    
 |   0   |    Card    |
 |   1   |    Cash    |
 |   2   |    Check   |
 |   3   |    Other   |


<a name="MongoDB-Database-Schema"/>

## MongoDB Database Schema
The MongoDB has several collections but some of the collections reuse the same model so below is just a documentation of the models used. They can also be viewed in more details under `/backend/server/models`

**Reservation Model**: describes a reservation data/record and used by Current, Pending, and Delete Reservation Collection
```bash
{
  Checked: 
  BookingID: 
  CustomerID: 
  YearID: 
  MonthID: 
  ReservationID:
  PaymentID: 
  RoomID: 
  StateID: 
  firstName: 
  lastName: 
  email: 
  phone: 
  pricePaid:
  tax: 
  checkIn: 
  checkOut: 
  numGuests: 
  comments: 
  created_date: 
}
```

**DailyReport Model**: describes a daily report for a given day which contains records of reservation and housekeeping for each room
```bash
{
  YearID: 
  MonthID:
  Date:
  Refund: { 
    Amount: 
    Notes: 
  },
  Stays: {
    101: {
      Room: {
        BookingID:
        type: 
        payment:
        startDate: 
        endDate: 
        paid: 
        rate: 
        tax:
        notes:
        initial:
      },
      Housekeeping: {
        status:
        type:
        houseKeeper:
        notes:
      }
    }, 
    102: 
    103: 
    ...
    126:
  }
}
```

**Maintenance Model**: models documents for Maintenance Log Collection
```bash
  {
    _id:
    Name:
    Facilities: [{
      completed:
      date: 
      description: 
      cost:
    }],
    101: [],
    ...
    126: [],
  }
```

**Staff Model**: Stores authenticated users in Staff Collection
```bash
  {
    firstName:
    lastName: 
    username:
    email:
    hashPassword:
    position:
    created_date:
  }
```

<a name="Development"/>

## Development

For the frontend, this project uses create-react-app and RazzleJS boilerplates with webpack for rapid development, codesandbox for design and style testing and redux-dev-tools for react-redux development. 

For the backend, this project uses ExpressJS framework to create servers and postman to test api endpoints. 

For the database: 
  - For MySQL, this project runs a MySQL server locally with a UI of the database using MySQL workbench
  - For Mongo, this projects connects to a MongoDB cluster dev database on MongoAtlas 

This project uses Editor Config to standardize editor configuration 
Visit http://editorconfig.org for details 

This project uses Eslint to detect suspicious code in JS files 

<a name="Testing"/>

## Testing
This project uses Mocha and Chai for testing of backend services. **NOTE** that current testing of the codebase is just a few unit tests of the backend services and the code coverage is a very low percentage. This will be implemented further in the future as well as frontend testing and usage of React propTypes.

Visit http://mochajs.org and http://chaijs.org for details.

To execute test: 

```bash 
cd backend/
npm test 
```

<a name="Debugging"/>

## Debugging

This project uses https://www.npmjs.com/package/debug for development logging in the backend. To start `nodemon` and enable logging:

```bash
cd backend/
npm run debug
```

<a name="Deployment"/>

## Deployment
This project can be deployment two ways as seen in the `/deployment` directory, using docker-compose with nginx or with kubernetes. I will go into details about the current deployment which is with DigitalOcean Kubernetes

All four services are built into a docker image as described by the `Dockerfile` in each services' directory. These images are hosted publically on Dockerhub with their own repo to track version.
  - **Frontend-Management**: an NGINX image that serves the static file index.html of SPA at every route request. The separate JS files are served separately in a CDN
  - **Frontend-Landing**: a Node image that server-side renders a website with separate JS files served separately in a CDN
  - **Backend-API**: a Node image that runs an Express API server
  - **Backend-Agenda**: a Node image that runs a background processing server

Each image is pulled into pods into kubernetes cluster which is currently running a replica of one pod per service. There are currently four deployments running with each deployment corresponding to each service (Management System Frontend, Website, API Server, Agenda Server). 
> The `api` and `agenda` deployments all pass in a kubernetes secret with corresponding environment variables

The pods of each deployment are exposed through kubernetes' default service ClusterIP that is configured to listen on `PORT:80`. 

In front of the kubernetes cluster is an NGINX Ingress Controller which exposes the kubernetes cluster on a public IP address. The address is then mapped to two DNS A records: 
  - `bigskylodge.com` routes to hotel website
  - `admins.bigskylodge.com/staff` routes to management system 
  - `admins.bigskylodge.com/api` routes to Express API server
  - `admins.bigskylodge.com/dash` routes to background-processing dashboard 

The MySQL database is hosted on DigitalOcean Managed Database and MongoDB is hosted on MongoAtlas. Both database whitelists the public IP address of the kubernetes nodes.

The static and media files of the frontend are hosted on CDN using DigitalOcean Spaces. 

<a name="Future-Features-and-Issues"/>

## Future Features and Issues

**Features**
 - **Booking Engine**: a booking engine that takes in reservations, stores credit card information securely, and connects to the management system 
 - **Analytics**: a analytics feature in the management system 
 - **Decoupled Authentication**: decouple the authentication service from the backend into its own server and strenghten it

**Issues**
  - When a user that is authenticated into the app clears all cookies from their browser, app automatically logs out the user.
  - When a user is automatically logged out after their token has expired, when they log back in, prevent the initial page load and preserve their state so they can leave right where they left off.

<a name="Credits"/>

## Credits
This project would not be possible without the huge open source community out there. All the fantastic modules, cool UI features, free services, medium blogs, and detailed documentations that have made this project possible and helped me learn and grow alot. Thank you! 

Also thanks to [gifcap](#https://gifcap.dev/) for the easy animations!


<div align="center">
<img src="/uploads/2a53d8cba5191fdd908cb53bfe7aa07a/motelDisp__2_.jpg" align="center" width="35% alt="Project icon">

# Hotel Management System

</div>

This project is landing page (website) and management system for small-scale hotel operations with ability to manage/track revenue in short-term and long-term stayss, tax reports/revenue, as well as housekeeping operations and maintenance logs with more features to come in the future! 

It is built as a full-stack javascript application and deployed to Digital Ocean Kubernetes with static files served from DigitalOcean Spaces. See below for [infrastructure](#Infrastructure).
  - **Frontend-Hotel Website**: SSR App Boilerplated with RazzleJS and Styled with MaterialUI 
  - **Frontend-Management System**: React-Redux App Styled with MaterialUI, 
  - **Backend-API**: Express-Node API Server with JWT Authentication
  - **Backend-Jobs**: Repeating Jobs and Email Queue using AgendaJS and Agendash
  - **Database** MySQL DB on DigitalOcean Managed DB and MongoDB on MongoAtlas

<div align="center">
<img src="/uploads/278ec5c966fb98df11afdc5da8fea7da/MotelManagementDemo.gif"  width="80%" height="80%">
<img src="/uploads/e58747274b4b5e3274a5f3e6109ec9cb/MotelManagementLanding.JPG">

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

4. Run Sequlize Migration and Seed files `npm run migrateToDev`

5. Edit `.env` located in the backend root directory with appropriate variables and save

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
6. [MySQL Database Schema](#MySQL-Database Schema)
7. [MongoDB Database Schema](#MongoDB-Database-Schema)
8. [Development](#Development)
9. [Testing](#Testing)
10. [Debugging](#Debugging)
11. [Deployment](#Deployment)
12. [Credits](#Credit)

<a name="Infrastructure"/>

## Infrastructure

<div align="center">
<img src="/uploads/9073ce0de580093eae62a3d10eb688fe/MotelManagmentArch.JPG"  width="80%" height="80%">
</div>

Above is the infrastructure of the entire application based on a microservice architecture. There are currently 4 microservices which the potential and ease to add new services to the application. 
  - Frontend Website Service
  - Frontend Management System Service
  - Backend API Service
  - Background Processing Service 

The main application logic is deployed to DigitalOcean Kubernetes for a resilent and scalable platform. The IP address of each  kubernetes nodes are whitelisted on the corresponding database servers for secure communication. 

The kubernetes cluster is exposed with a public IP address using the NGINX Ingress Controller, which acts as a reverse-proxy to send users to the appropriate service. 

The public IP address of the NGINX Controller is mapped to two DNS A records `www.bigskylodge.com admin.bigskylodge.com` with HTTPS protocol.

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

The management system is a [react-redux](#https://react-redux.js.org/) single page application bootstrapped with [create-react-app](#https://github.com/facebook/create-react-app). It proxies requests to an [API backend server](#Backend-API) for database persistence and is authenticated using jwt-tokens signed from the backend.

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
```bash 
searchType: 'none'   // Specifies what table or collection should be queried. [Customer, Pending/Delete Reservation Collection, Blacklists]
results: []          // The array of reservation/customer objects returned from the API request
```

The form state consists of the following with default value: 
```bash 
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

Once a employee logins, their jwt token will expire 30 minutes from the time it is signed. After that 30 minutes is up, any subsequent dispatch will logout the user and require a login for a new token. More details of this can be found below in challenges.

The management system also takes into consideration the authorization of each user based on the `position` field 
```bash 
position field: 
0 = Owners
1 = Managers
3 = Housekeepers
```

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

```bash 
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

```bash 
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

```bash 
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
```bash 
  <FormActions
    submitForm={submitForm}
    handleForm={handleSubmit}
    isSubmitting={isSubmitting}
    type={type}
  />
```

In the `<FormActions>` component, it'll set different names of button depending on form type and render only buttons that need to be rendered as well as their appropriate name: 
```bash
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

```bash 
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

**Future Issues to Resolve:**
1. When a user that is authenticated into the app clears all cookies from their browser, app automatically logs out the user.
2. When a user is automatically logged out after their token has expired, when they log back in, prevent the initial page load and preserve their state so they can leave right where they left off.


<a name="Backend-API"/>

## Backend API

<a name="Backend-Jobs"/>

## Backend Jobs

<a name="MySQL-Database-Schema"/>

## MySQL Database Schema

<a name="MongoDB-Database-Schema"/>

## MongoDB Database Schema

<a name="Development"/>

## Development

<a name="Testing"/>

## Testing

<a name="Debugging"/>

## Debugging

<a name="Deployment"/>

## Deployment

<a name="Credits"/>

## Credits
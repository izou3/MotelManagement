<div align="center">
<img src="https://user-images.githubusercontent.com/55326650/98072762-c8260680-1e34-11eb-93d7-224da3deb08d.jpg" align="center" width="35% alt="Project icon">

# Hotel Management System

</div>

This project is a landing page (website) and management system for small-scale hotel operations with ability to manage/track revenue in short-term and long-term stays, email reservation confirmations, generate financial reports, as well as track housekeeping operations and maintenance logs for multiple motels with more features to come in the future! 

It is built as a full-stack javascript application deployed to Digital Ocean Kubernetes. See below for [infrastructure](#Infrastructure).
  - **Frontend-Hotel Website**: SSR App Boilerplated with RazzleJS and Styled with MaterialUI 
  - **Frontend-Management System**: React-Redux App Styled with MaterialUI, 
  - **Backend-API**: Express-Node API Server with WebSockets for concurrent users and JWT for authentication
  - **Backend-Jobs**: Repeating Jobs and an Email Messaging Queue using AgendaJS and Agendash
  - **Database** MySQLDB on DigitalOcean DB servers and MongoDB on MongoAtlas

<div align="center">
<img src="https://user-images.githubusercontent.com/55326650/98072588-5b127100-1e34-11eb-94ab-e472a2abce6a.gif"  width="80%" height="80%">
<img src="https://user-images.githubusercontent.com/55326650/98072733-b3497300-1e34-11eb-996c-c5f488329a8e.JPG">

##### **Website Live At [www.bigskylodge.com](https://www.bigskylodge.com)**

</div>

# Documentation
## Table of Contents
1. [Business Logic/User Guide](#User-Guide)
2. [Infrastructure](#Infrastructure)
3. [Frontend-Website](#Landing-Page)
4. [Frontend-Management System](#Management-System)
5. [Backend-API](#Backend-API)
6. [Backend-Jobs](#Backend-Jobs)
7. [MySQL Database Schema](#MySQL-Database-Schema)
8. [MongoDB Database Schema](#MongoDB-Database-Schema)
9. [Development](#Development)
10. [Testing](#Testing)
11. [Debugging](#Debugging)
12. [Future Features and Issues](#Future-Features-and-Issues)
13. [Credits](#Credit)

<a name="User-Guide"/>

## Business Logic/User Guide
This management system is a specific way of managing small hotel operations, especially for small businesses. 

Read more [here](https://github.com/izou3/MotelManagement/files/5792070/Motel.Management.Demo.Print.pdf)

<a name="Infrastructure"/>

## Infrastructure

<div align="center">
<img src="https://user-images.githubusercontent.com/55326650/104113066-f0faca00-52c3-11eb-82f6-a374327aec12.JPG"  width="80%" height="80%">
</div>

Above is the infrastructure of the entire application based on a microservice architecture. There are currently 4 services with the potential and ease to add new services to the application or separate existing ones. 
  - Frontend Website Service
  - Frontend Management System Service
  - Backend API and Websocket Service
  - Background Processing Service 

The main application logic is deployed to DigitalOcean Kubernetes for a resilent and scalable platform operating in a VPC network with the Digital Ocean MySQL database cluster.  

The kubernetes cluster is exposed with the NGINX Ingress Controller with routing rules to delivery users to corresponding services and appropriate headers set to allow websocket connections through the Digital Ocean load balancer.

Static contents such as images, fonts, and javascript files are served from on the public network through DigitalOcean Spaces CDN for fast delivery while database servers are queried though the private network. 

<a name="Landing-Page"/>

## Landing Page

The hotel website is a universial javascript application bootstrapped with [RazzleJS](#https://razzlejs.org/getting-started) and styled with [MaterialUI](#https://material-ui.com/). It consists of five pages that detail the hotel's information and local area guides. 
 - **Home**: Main hotel page with description, photos, and some recent reviews
 - **Accomodations**: The types of rooms and amenities available at the hotel as well as policies
 - **Attractions**: Local area tourists spots and guides
 - **Location** Google Maps API to display a google map of the location of the hotel
 - **Reservation** iframe from a booking engine that redirects to your reservation portal

 #### Future Features
 - **Booking Engine**: a booking engine that takes in reservations, stores credit card information securely through PCI compliance, and connects to the management system 


<a name="Management-System"/>

## Management System

The management system is a [react-redux](#https://react-redux.js.org/) single page application bootstrapped with [create-react-app](#https://github.com/facebook/create-react-app). It opens up a socket connection and proxies requests to an [API backend server](#Backend-API) for database persistence and is authenticated using jwt-tokens signed from the backend.

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

*Redux Directory*: Holds redux components
    - Actions  -> redux action functions that return a type and payload
    - Reducers -> redux reducers for each indivial state
    - thunks   -> redux thunks for async operations
    - store    -> redux store with redux middlewares

This app utlizes the following open-source projects/resources for display and manipulation of data: 
   - [MomentJS](#https://momentjs.com/)
   - [Axios](#https://github.com/axios/axios)
   - [js-file-download](#https://www.npmjs.com/package/js-file-download)
   - [Formik](#https://formik.org/)
   - [Formik-Material-UI](#https://github.com/stackworx/formik-material-ui)
   - [Material-Table](#https://material-table.com/#/)

---
### Features
---
  * Interface suitable for multiple properties and different types of users
  * Idle to timeout and logout the user after an amount of inactivity
  * Live updates of existing and new guests across multiple users/staff
  * Store and track current guests and feature reservations
  * Daily Reports for tracking guests with extended/long-term stays
  * Maintenance Sheet to track daily and annual maintenance and cleaning procedures
  * Housekeeping sheet to track rooms status specific to the hotel's operation
  * Email confirmation with new reservations
  * Generate monthly financial reports
  * Authorization and limitation of users with differing positions

---
### Handling Multiple Hotel Systems
---

The frontend systems currently serves three Hotels specified in the backend but uses the same interface and API server to serve the hotels. Socket connections and broadcasts are differentiated based on the room that the user joins upon login (Each hotel has a different room). API requests are differentiated with a HotelID query parameter and the hotel room numbers are determine by an array that the backend sends upon login. This array is stored in the redux state and is used to display corresponding hotel room numbers on the frontend for users to interact with. 

---
### Redux Middlewares
---

Most of the middlewares used are for checking token expiration as well as locking the app between a certain time to allow for the new day's daily report to generate. The other middlewares are thunks for async operations, a socket middleware for emitting and listening socket events, and a batch action middleware to batch actions together for a single render pass.


**Future Issues to Resolve:**
1. When a user is automatically logged out after their token has expired, when they log back in, prevent the initial page load and preserve their state so they can leave right where they left off.

**Future Features:**
1. When a user has been timed out, preserve the current state so user won't lose data when they log back in
1. Analytics page to compile existing data and show growth and other trends
2. Integratation with a booking engine to receieve reservations directly from the website
3. Integration with existing OTAs to load reservations from there

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

The backend api server serves as a gateway between the frontend and the database, manipluating data through transaction queries and mongo aggregations to return the desired result that the frontend requests as well as broadcasting live updates across its socket connections. Because the backend server has to be able to serve different hotels each with different room numbers and their own reservations, a `HotelID` query string is used to differentiate API requests. 

All backend api requests go through `/api` route where an express router autenticates the request and sends the it to the matching router. A hotel check middleware also intercepts the request, obtains the `HotelID` of the request and stores it in a Conductor for it to use to run commands that execute the business logic. 

All login requests go through `/user` route where an express router directs login and logout requests to their matching router as well as join or leave socket rooms accordingly.

The backend is currently encapsulated into three layers of logic
  * Controller: handles all API routes
  * Services: business logic
  * Date-Access: queries for databases with an OO approach to preserve encapsulation and resuse objects through JS prototypical inheritance

<div align="center">
<img src="https://user-images.githubusercontent.com/55326650/101309870-608c1e00-381b-11eb-8303-6c6032fb1faf.JPG" width="50%" height="60%">
</div>

---
### Features
---
1. Broadcasts live updates to the frontend across users in the same room for specific API requests
2. JWT for securing APIs and Socket connection
3. API Data validation and formatting middlewares for every route
4. Message queue to send email confirmations for new reservation requests
5. Code coverage and testing
6. DB migrations for MySQL

--- 
### Integration of Websockets with Frontend
---

Whenever any user connects on the frontend, a socket connection is established between the frontend and the backend. When the user logins in successfully or logs out, the user joins or leaves the specific hotel room based on their credentials. The integration of websockets with the frontend is done mainly through a redux-socketio middleware that the frontend employs. When a specific type of action is dispatched in the frontend, an event is emitted for the backend to process. The backend will then process the new event and broadcast accordingly to the other users of the room by dispatching a redux action for the frontend of the different users to execute. 

---
### Tax Report Service (Mongo Aggregation)
---
This service is in charge of genrating a tax report using the documents in the **DailyReport Collection**. The tax report is stored anywhere in the database so it'll need to be generated with every request. To do this, it takes advantage of the mongo aggregation framework using a 12 stage pipeline to generate an array of object that has records for every day of the month and a final record of total and averages. This array is then parsed into a csv object that is send to the frontend for the user to download. 

<div align="center">
<img src="https://user-images.githubusercontent.com/55326650/98072806-e68c0200-1e34-11eb-9fe7-4aec69b8ab77.JPG"  width="80%" height="80%">

*This is only an example tax report with Daily Report records for the following date. A real-world one would contain all the dates of the month*

</div> 

--- 
### Future Features and Updates
---
1. Separate the authentication service into its own server from the API server
2. Separate the socket connection into its own server from the API server
3. Integrate a Redis DB into the system to account for multiple instances of the socket connection when scaling pods in k8s
5. Possibly look into NestJS and rebuild the codebase into the NestJS framework

<a name="Backend-Jobs"/>

## Backend Jobs
The background processing express server runs an [AgendaJS](#https://github.com/agenda/agenda) instance with a route to an [Agendash](#https://github.com/agenda/agendash) dashboard to track all the jobs. 

The agenda instance is backed by a collection in the MongoDB where it stores job deinfitions as well as a job queue. The instance will process the collection for jobs it has to run every 5 minutes with each instance able to lock up 2 jobs at once for every process. 

```javascript 
    const agenda = new Agenda()
      .processEvery('1 minute')
      .lockLimit(2)
      .mongo(connection.db, 'AgendaJobs');
```
**Current Jobs**
---
  - **GenerateDailyReport**: A repeating job that generates a new DailyReport for each motels 
  - **UpdateCurrent**: A repeating job that moves reservation checking in within 48 hours of the current day from **Pending Reservation Collecion* to *Current Reservation Collection* for each motel
  - **ReservationConfirmation**: An email messsaging queue. Emails are produced and passed into the queue by the **API-Server** whenever a new reservation is created. The **Agenda** server instance then consumers the emails and sends them out

--- 
### Future Features and Updates
---
1. Migrate from AgendaJS to RabbitMQ for background processing

<a name="MySQL-Database-Schema"/>

## MySQL Database Schema
The MySQL database schema holds reservations who have checked out called *Customers*. The schema described below was designed with the intent of storing repeat customers. 

*Customer Table*: 

   | CustomerID    | YearID | MonthID | first_name | last_name | email | phone | state |
   | ------------- |:------:| :------:| :---------:| :--------:| :----:| :----:| -----:|


*IndCustomer Table (For repeat guests):*

   | BookingID     | CustomerID | price_paid | tax | check_in | check_out | num_guests | ReservationID | PaymentID | RoomID | created_at | comments  | HotelID | RoomStyle |
   | ------------- |:----------:| :---------:| :--:| :-------:| :--------:| :---------:| :------------:| :--------:| :-----:| :---------:| :-------:| :------:|
   
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
  HotelID: 
  RoomStyle:
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

<a name="Credits"/>

## Credits
This project would not be possible without the huge open source community out there. All the fantastic modules, cool UI features, free services, medium blogs, and detailed documentations that have made this project possible and helped me learn and grow alot. Thank you! 

  - [MomentJS](#https://momentjs.com/)
  - [Axios](#https://github.com/axios/axios)
  - [js-file-download](#https://www.npmjs.com/package/js-file-download)
  - [Formik](#https://formik.org/)
  - [Formik-Material-UI](#https://github.com/stackworx/formik-material-ui)
  - [Material-Table](#https://material-table.com/#/)
  - [ExpressJS](#https://expressjs.com/) 
  - [SocketIO](https://socket.io/)
  - [jsonwebtoken](#https://github.com/auth0/node-jsonwebtoken)
  - [mysql2](#https://github.com/sidorares/node-mysql2)
  - [mongoose](#https://mongoosejs.com/)
  - [Morgan](#https://github.com/expressjs/morgan) 
  - [Winston](#https://github.com/winstonjs/winston)
  - [Sequelize](#https://sequelize.org/)
  - [Nodemailer](#https://nodemailer.com/about/)

Also thanks to [gifcap](#https://gifcap.dev/) for the easy animations!


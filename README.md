<div align="center">
<img src="/uploads/2a53d8cba5191fdd908cb53bfe7aa07a/motelDisp__2_.jpg" align="center" width="35% alt="Project icon">

# Hotel Management System

</div>

This project is landing page (website) and management system for small-scale hotel operations with ability to manage/track revenue in short-term and long-term reservations, tax reports/revenue, as well as housekeeping operations and maintenance logs with more features to come in the future! 

It is built as a full-stack javascript application and deployed to Digital Ocean Kubernetes with static files served from DigitalOcean Spaces 
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

<a name="Management-System"/>

## Management System

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
/**
 * Module Dependencies
 */
const express = require('express');
const bodyParser = require('body-parser');
const debug = require('debug')('motel:http');

const router = express();

/**
 * Route Services
 */
const customerRoutes = require('./customerRoute.js');
const blacklistRoutes = require('./backlistRoute');
const reservationRoutes = require('./reservationRoute');
const ResCustRoutes = require('./crossRoute');
const DailyReportRoutes = require('./reportRoutes');
const MaintenanceRoutes = require('./maintenanceRoute');
const searchRoute = require('./searchRoute');

module.exports = (param) => {
  const { mongo, sqlPool, agenda } = param;

  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(bodyParser.json());

  // Customer Query Operations against MySQL
  router.use('/customer', customerRoutes({ sqlPool }));

  // BlackList Customer Query Operations against MySQL
  router.use('/blacklist', blacklistRoutes({ sqlPool }));

  // Reservation Query Operations against Mongo
  router.use('/reservation', reservationRoutes({ mongo, agenda }));

  // Query Operations that are performed Between Customer against SQL and Reservation against Mongo
  router.use('/resCustomer', ResCustRoutes({ sqlPool }));

  // Search Operations that search for records in Customer, Reservations, and Blacklist
  router.use('/search', searchRoute({ sqlPool }));

  // DailyReport Collection Query Operations Performed against Mongo
  router.use('/dailyreport', DailyReportRoutes());

  // Maintenance Collection Query Operations Performed Against Mongo
  router.use('/maintenance', MaintenanceRoutes());

  router.use((req, res) => {
    const error = new Error('Undefined Route');
    res.status(404).json({ message: error.message });
  });

  return router;
};

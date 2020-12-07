/**
 * Module Dependencies
 */
const express = require('express');

const router = express();

/**
 * Route Services
 */
const staffRoutes = require('./staffRoute');
const customerRoutes = require('./customerRoute.js');
const blacklistRoutes = require('./backlistRoute');
const reservationRoutes = require('./reservationRoute');
const DailyReportRoutes = require('./reportRoutes');
const MaintenanceRoutes = require('./maintenanceRoute');
const searchRoute = require('./searchRoute');

// Hotel Check Middleware
const { HotelIDRequired } = require('../../middlewares/HotelCheck');

module.exports = (param) => {
  const { sqlPool } = param;

  router.use(HotelIDRequired);

  // Manage Staff Operations against Mongo
  router.use('/staff', staffRoutes());

  // Customer Query Operations against MySQL
  router.use('/customer', customerRoutes({ sqlPool }));

  // BlackList Customer Query Operations against MySQL
  router.use('/blacklist', blacklistRoutes({ sqlPool }));

  // Reservation Query Operations against Mongo
  router.use('/reservation', reservationRoutes());

  // Search Operations that search for records in Customer, Reservations, and Blacklist
  router.use('/search', searchRoute({ sqlPool }));

  // DailyReport Collection Query Operations Performed against Mongo
  router.use('/dailyreport', DailyReportRoutes());

  // Maintenance Collection Query Operations Performed Against Mongo
  router.use('/maintenance', MaintenanceRoutes());

  router.use((req, res, next) => {
    const error = new Error('Undefined Route');
    error.status = 404;
    next(error);
  });

  return router;
};

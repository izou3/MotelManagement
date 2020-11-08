/**
 * Module Dependencies
 */
const express = require('express');
const bodyParser = require('body-parser');
const debug = require('debug')('motel:http');

const router = express();

// Authentication Services
const { loginRequired, login, register, logout } = require('../services/Staff');
const { getAllStaff, updateStaff, deleteStaff } = require('../services/Staff');

module.exports = () => {
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(bodyParser.json());

  // Login route
  router.route('/login').post(login);

  // Logout Staff
  router.route('/logout').get(logout);

  /**
   * @route routes to get, add, update and delete staff members
   */
  router
    .route('/')
    .all(loginRequired) // Authentication Middleware
    .get(async (req, res) => {
      try {
        const result = await getAllStaff();
        if (result.length === 0) {
          throw new Error('No Staff Found');
        }
        return res.send(result);
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }
    })
    .post(async (req, res) => {
      try {
        const result = await register(req.body);
        debug(result);
        return res.send(result);
      } catch (err) {
        return res.status(400).send({
          message: err.message,
        });
      }
    })
    .put(async (req, res) => {
      try {
        const result = await updateStaff(req.body);
        if (!result) throw new Error('No Staff with Username Found');
        return res.send(result);
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }
    })
    .delete(async (req, res) => {
      try {
        const { username } = req.query;
        const result = await deleteStaff(username);
        if (!result) throw new Error('Username Does Not Exist');
        return res.send({ message: 'Successfully Deleted' });
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }
    });

  // 404 Error Handler
  router.use((req, res, next) => {
    const error = new Error('Undefined Route');
    error.status = 404;
    next(error);
  });

  return router;
};

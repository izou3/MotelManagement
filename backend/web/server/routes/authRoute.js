/**
 * Module Dependencies
 */
const express = require('express');

const router = express();

// Commands
const Conductor = require('../../../services/conductor');

const { Login, Logout } = require('../../../services/StaffCommands/Auth');

module.exports = (param) => {
  const { sqlPool } = param;
  // Login route
  router.route('/login').post((req, res, next) => {
    return Conductor.run(new Login(req, res, sqlPool))
      .then((result) => {
        console.log(result);
        const { token, user, MotelInfo, MotelRoom } = result;
        return res
          .cookie('token', token, { httpOnly: true, SameSite: 'strict' }) // Limit CSRF attacks
          .send({
            user,
            MotelInfo,
            MotelRoom,
          });
      })
      .catch(() => {
        const error = new Error('Failed to Login');
        error.status = 400;
        return next(error);
      });
  });

  // Logout Staff
  router.route('/logout').get((req, res, next) => {
    return Conductor.run(new Logout(req, res)).catch((err) => {
      const error = new Error(err.message);
      error.status = 400;
      return next(error);
    });
  });

  return router;
};

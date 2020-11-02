/**
 * Module Dependencies
 */
import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';

/**
 * Private Route to render components based on Authenticatation and User
 * @param {Component} component The Component to Render Based on Authentication and User
 * @param {Object} auth         The authentication of the user
 * @param {Array}  access       Array of numbers corresponding to PositionIDs of user who has access to component
 */
// eslint-disable-next-line no-shadow
const PrivateRoute = ({ component: Component, auth, access, ...rest }) => {
  return (
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
  );
};

export default PrivateRoute;

import React from 'react';

//App Imports
import Home from '../Modules/pages/Home';
import Room from '../Modules/pages/Room';
import Location from '../Modules/pages/Location';
import Reservation from '../Modules/pages/Reservations';
import Attractions from '../Modules/pages/Attractions';
import NotFound from '../Modules/pages/Error';

export default [
  {
    path: '/',
    exact: true,
    component: Home,
  },
  {
    path: '/home',
    exact: true,
    component: Home
  },
  {
    path: '/rooms',
    exact: true,
    component: Room,
  },
  {
    path: '/location',
    exact: true,
    component: Location,
  },
  {
    path: '/reservations',
    exact: true,
    component: Reservation,
  },
  {
    path: '/attractions',
    exact: true,
    component: Attractions,
  },
  //404 route
  {
    component: NotFound
  }
];

/**
 * Module Dependencies
 */
import React from 'react';
import moment from 'moment';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// Idle Component
import { useIdleTimer } from 'react-idle-timer';

// Redux Dependencies
import { connect, useDispatch } from 'react-redux';
import { batchActions } from 'redux-batched-actions';

// Thunks
import { logoutStaff } from './redux/thunks/authThunks';
import initialPageLoad from './redux/thunks/thunks';
import { initialMaintenanceLog } from './redux/thunks/reportThunks';

// Dashboard Components
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Search from './pages/Query';
import Report from './pages/Report';
import HouseKeepingReport from './pages/Housekeeping';
import TaxReport from './pages/TaxReport';
import Maintenance from './pages/Maintenance';
import Staff from './pages/Staff';
import Error from './pages/Error';

const App = ({ auth }) => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    if (auth.isAuthenticated) {
      const today = moment().format('YYYY-MM-DD');
      dispatch(batchActions([initialPageLoad(today), initialMaintenanceLog()]));
    }
  }, [auth.isAuthenticated, dispatch]);

  const handleOnIdle = () => {
    // If user is logged in, log out user if Idle timeout is up
    if (auth.isAuthenticated) {
      // eslint-disable-next-line no-console
      console.log('user timeout');
      dispatch({ type: 'IDLE_USER' });
    }
  };

  /**
   * React Idle Hook to set a timeout of inactivity and a handler to
   * execute if timeout is reached
   */
  useIdleTimer({
    timeout: 20 * 60000, // Time until Idle which is 20 Minutes
    onIdle: handleOnIdle, // Handler for Idle
  });

  return (
    <>
      <Router>
        <Switch>
          <Route exact path="/staff/login" component={Login} />
          <Route
            exact
            path="/dash"
            // eslint-disable-next-line no-return-assign
            render={() =>
              (window.location = 'https://api.bigskylodge.com/dash/')
            }
          />
          <PrivateRoute
            exact
            path="/staff/"
            component={Home}
            auth={auth}
            access={[0, 1]} // Corresponding PositionID of user who has access to route
          />
          <PrivateRoute
            exact
            path="/staff/search"
            component={Search}
            auth={auth}
            access={[0, 1]}
          />
          <PrivateRoute
            exact
            path="/staff/report"
            component={Report}
            auth={auth}
            access={[0, 1]}
          />
          <PrivateRoute
            exact
            path="/staff/housekeeping"
            component={HouseKeepingReport}
            auth={auth}
            access={[0, 1, 2]}
          />
          <PrivateRoute
            exact
            path="/staff/maintenance"
            component={Maintenance}
            auth={auth}
            access={[0, 1]}
          />
          <PrivateRoute
            exact
            path="/staff/taxreport"
            component={TaxReport}
            auth={auth}
            access={[0]}
          />
          <PrivateRoute
            exact
            path="/staff/staff"
            component={Staff}
            auth={auth}
            access={[0]}
          />
          <Route component={Error} />
        </Switch>
      </Router>
    </>
  );
};

const mapStateToProps = (state) => ({
  auth: state.authState,
});

const mapDispatchToProps = (dispatch) => ({
  logout: (redirect) => dispatch(logoutStaff(redirect)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);

/**
 * Module Dependencies
 */
import React from 'react';
import moment from 'moment';

// MaterialUI Components and Icons
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Grid, Button, Typography, Box } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import MuiAlert from '@material-ui/lab/Alert';

// formik and formik-material-ui
import { Formik, Form, Field } from 'formik';

import MaterialTable from 'material-table';
import { DatePicker } from 'formik-material-ui-pickers';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

// Redux Components
import { connect } from 'react-redux';

import {
  loadHouseKeepingReportOnSearch,
  updateHouseKeepingReportOnAction,
} from '../redux/thunks/reportThunks';

import { logoutStaff } from '../redux/thunks/authThunks';

import {
  snackBarFail,
  snackBarSuccess,
  snackBarClose,
} from '../redux/actions/actions';

// Components
import FullPageLoader from '../components/FullPageLoader';
import NavBar from '../components/NavBar';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  search: {
    width: '30%',
    marginBottom: '1em',
    padding: theme.spacing(1),
  },
}));

/**
 * Stateless Component to Render MaterialUI Alert
 */
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

/**
 * Render the Daily Report Component
 * @param {Object} param Redux State, Actions, and Thunks
 */
const Report = ({
  auth,
  loading,
  snackBar,
  houseKeepingDate,
  houseKeepingReport,
  logout,
  loadHouseKeepingReport,
  updateHouseKeepingRecord,
  snackBarFailed,
  closeSnackBar,
}) => {
  const classes = useStyles();

  const [selectedRow, setSelectedRow] = React.useState(null);

  const columns = [
    {
      title: 'Room',
      field: 'RoomID',
      type: 'string',
      editable: 'never',
    },
    {
      title: 'Type',
      field: 'type',
      type: 'string',
    },
    { title: 'Status', field: 'status', type: 'string' },
    {
      title: 'HouseKeeper',
      field: 'houseKeeper',
      type: 'string',
    },
    { title: 'Notes', field: 'notes', type: 'string' },
  ];

  return (
    <div className={classes.root}>
      <CssBaseline />
      <NavBar logout={logout} userInfo={auth.user} />
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <>
          <Snackbar
            open={snackBar.open}
            autoHideDuration={2000}
            onClose={closeSnackBar}
          >
            <Alert severity={snackBar.alert}>{snackBar.message}</Alert>
          </Snackbar>
          <FullPageLoader loading={loading} />
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="h5">
              <Box fontWeight="fontWeightBold">
                {`HouseKeeping Report for ${moment(
                  houseKeepingDate,
                  'YYYY-MM-DD'
                ).format('dddd, MMMM Do YYYY')}`}
              </Box>
            </Typography>
            <Paper elevation={3} className={classes.search}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Formik
                  initialValues={{
                    reportSearch: moment(),
                  }}
                  validate={(values) => {
                    const errors = {};

                    if (moment().isBefore(values.reportSearch)) {
                      snackBarFailed('Not a Valid Date');
                      errors.reportSearch = 'Not a Valid Date';
                    }

                    return errors;
                  }}
                  onSubmit={(values, { setSubmitting }) => {
                    setSubmitting(true);
                    loadHouseKeepingReport(
                      moment(values.reportSearch).format('YYYY-MM-DD')
                    );
                    setSubmitting(false);
                  }}
                >
                  {({ submitForm }) => (
                    <Form>
                      <Grid
                        container
                        justify="space-around"
                        alignItems="center"
                      >
                        <Grid item xs={8}>
                          <Field
                            fullWidth
                            component={DatePicker}
                            variant="outlined"
                            name="reportSearch"
                            label="Date"
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={submitForm}
                          >
                            Search
                          </Button>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              </MuiPickersUtilsProvider>
            </Paper>
          </Grid>
          <MaterialTable
            className={classes.tableDisp}
            columns={columns}
            data={houseKeepingReport}
            // eslint-disable-next-line no-shadow
            options={{
              search: false,
              toolbar: false,
              paging: true,
              headerStyle: {
                fontWeight: 'bold',
              },
              rowStyle: (rowData) => ({
                backgroundColor:
                  selectedRow === rowData.tableData.id ? '#EEE' : '#FFF',
              }),
            }}
            editable={{
              onRowUpdate: (newData) =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    /**
                     * Error Validation
                     */
                    if (newData.status.trim().length === 0) {
                      /**
                       * Calling snackBarFailed(msg) does not render properly
                       */
                      reject();
                      // eslint-disable-next-line no-undef
                      alert('Room Status Cannot be Blank');
                      return;
                    }
                    if (
                      newData.status !== 'R' &&
                      newData.status !== 'C' &&
                      newData.status !== 'O'
                    ) {
                      reject();
                      // eslint-disable-next-line no-undef
                      alert('Not a Proper Room Status (R, C, O)');
                      return;
                    }

                    if (newData.type.trim().length === 0) {
                      reject();
                      // eslint-disable-next-line no-undef
                      alert('Room Type Cannot be Black');
                      return;
                    }
                    if (newData.type !== 'S' && newData.type !== 'W') {
                      reject();
                      // eslint-disable-next-line no-undef
                      alert('Not a Proper Room Type (W, S)');
                      return;
                    }

                    if (newData.houseKeeper.length > 30) {
                      reject();
                      // eslint-disable-next-line no-undef
                      alert('HouseKeeper Name Too Long');
                      return;
                    }

                    if (newData.notes.length > 250) {
                      reject();
                      // eslint-disable-next-line no-undef
                      alert('Room Notes Too Long');
                      return;
                    }

                    // Execute formSubmit
                    updateHouseKeepingRecord(newData);
                    resolve();
                  }, 100);
                }),
            }}
          />
        </>
      </main>
    </div>
  );
};

const mapStateToProps = (state) => ({
  auth: state.authState,
  houseKeepingDate: state.houseKeepingState.date,
  houseKeepingReport: state.houseKeepingState.houseKeepingReport,
  snackBar: state.snackBarState,
  loading: state.loadingState.isLoading,
});

const mapDispatchToProps = (dispatch) => ({
  logout: (redirect) => dispatch(logoutStaff(redirect)),
  loadHouseKeepingReport: (date, data) =>
    dispatch(loadHouseKeepingReportOnSearch(date, data)),
  updateHouseKeepingRecord: (data) =>
    dispatch(updateHouseKeepingReportOnAction(data)),

  snackBarSucceed: (msg) => dispatch(snackBarSuccess(msg)),
  snackBarFailed: (msg) => dispatch(snackBarFail(msg)),
  closeSnackBar: () => dispatch(snackBarClose()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Report);

/**
 * Module Dependencies
 */
import React, { useEffect } from 'react';
import moment from 'moment';
import Calendar from 'react-calendar';

// MaterialUI Components and Icons
import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import { Grid, Paper, Button, MenuItem } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Fab from '@material-ui/core/Fab';
import CssBaseline from '@material-ui/core/CssBaseline';

// Formik and formik-material-ui
import { Formik, Form, Field } from 'formik';

import { TextField } from 'formik-material-ui';
import { DatePicker } from 'formik-material-ui-pickers';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

// REDUX
import { connect } from 'react-redux';

import {
  createNewRes,
  updateReservation,
  updateDelReservation,
  cancelReservation,
  permDelReservation,
} from '../redux/thunks/reservationThunks';

import {
  updateCustomer,
  addBlackListCust,
  updateBlackListCust,
  removeBlackListCust,
} from '../redux/thunks/customerThunks';

import {
  searchResByID,
  searchResFirstName,
  searchResByCheckIn,
  searchResByCheckOut,
  searchCustomerByID,
  searchCustomerFirstName,
  searchCustomerByCheckIn,
  searchCustomerByCheckOut,
  searchDeleteResByID,
  searchDeleteResFirstName,
  searchDeleteResByCheckIn,
  searchDeleteResByCheckOut,
  searchBlackListByID,
  searchBlackListByFirstName,
} from '../redux/thunks/searchThunks';

import { logoutStaff } from '../redux/thunks/authThunks';

import {
  snackBarClose,
  snackBarFail,
  snackBarSuccess,
} from '../redux/actions/actions';

import {
  searchNone,
  searchByReservation,
  searchByDelRes,
  searchByCustomer,
  searchByBlackListCustomer,
  loadSearchResultFail,
} from '../redux/actions/searchActions';

import {
  loadForm,
  loadFormFail,
  loadSearchFormWithResData,
  loadSearchFormWithDelData,
  loadSearchFormWithCustData,
  loadSearchFormWithBLCustData,
} from '../redux/actions/formActions';

import 'react-calendar/dist/Calendar.css';

// Components
import NavBar from '../components/NavBar';
import MyForm from '../components/Form';
import RegTable from '../components/tables/RegTable';
import FullPageLoader from '../components/FullPageLoader';

import logger from '../logger';

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
  newResButton: {
    margin: theme.spacing(1, 1, 1),
    width: '100%',
  },
  calendar: {
    width: 'auto',
    border: 'none',
    borderRadius: '5px',
  },
  textField: {
    margin: theme.spacing(1, 0, 2),
  },
}));

/**
 * Stateless Component to Render MaterialUI Alert
 */
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

/**
 * Render the Search Query Component and Create Reservation
 * @param {Object} param Redux State, Actions, and Thunks
 */
const Query = ({
  auth,
  searchResult,
  searchType,
  formOpen,
  formData,
  formType,
  snackBar,

  searchResultClose,
  createNewReservation,
  closeForm,
  closeSnackBar,

  loading,
  loadFormOnAction,
  loadResSearchForm,
  loadDelResSearchForm,
  loadCustomerSearchForm,
  loadBLCustomerSearchForm,

  searchReservationByID,
  searchReservationByName,
  searchReservationByCheckIn,
  searchReservationByCheckOut,

  searchDelReservationByID,
  searchDelReservationByName,
  searchDelReservationByCheckIn,
  searchDelReservationByCheckOut,

  searchCustByID,
  searchCustByName,
  searchCustByCheckIn,
  searchCustByCheckOut,

  searchBLCustByName,
  searchBLCustByID,

  searchTypeNone,
  searchTypeReservation,
  searchTypeDelRes,
  searchTypeCustomer,
  searchTypeBlackList,

  updateRes,
  updateCust,
  updateDelRes,
  updateBLCust,

  addBLCust,
  removeBLCust,

  cancelRes,
  permDelRes,
  logout,
}) => {
  const classes = useStyles();
  const mountedRef = React.useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      searchResultClose();
    };
  }, [searchResultClose]);

  const closeForm2 = () => closeForm();

  const formAction1 = (resObj, roomID = 0) => {
    if (formType === 0) {
      logger('creating a new reservation');
      createNewReservation({ ...resObj, Checked: 2 });
    } else if (searchType === 'customer') {
      logger(`updating a customer ${resObj.BookingID}`);
      updateCust({ ...resObj, CustomerID: formData.CustomerID });
    } else if (searchType === 'reservation') {
      logger(`updating a reservation ${resObj.BookingID}`);
      updateRes(resObj);
    } else if (searchType === 'delReservation') {
      logger(`updating a Del Res${resObj.BookingID}`);
      updateDelRes(resObj);
    } else if (searchType === 'blacklistCustomer') {
      logger('updating baclkist customer');
      updateBLCust(resObj);
    }
  };

  const formAction2 = (data) => {
    if (formType === 4) {
      logger(`deleting reservation from pending ${data.BookingID}`);
      cancelRes(data.BookingID);
    } else if (formType === 5) {
      logger('permanently deleting reservation');
      permDelRes(data.BookingID);
    } else if (formType === 6) {
      logger('adding a blacklist customer');
      addBLCust({
        BookingID: data.BookingID,
        firstName: data.firstName,
        lastName: data.lastName,
        comments: data.comments,
      });
    } else if (formType === 7) {
      logger('removing a blacklist customer');
      removeBLCust(data.BookingID);
    }
  };

  // handler to open up the form
  const loadSearchFormData = (room, checked, BookingID = 0) => {
    let formObj = {};
    formObj = searchResult.find((obj) => obj.BookingID === BookingID);
    if (searchType === 'reservation') {
      logger('here in reservation search type');
      loadResSearchForm(formObj);
    } else if (searchType === 'delReservation') {
      logger('here in del reservation search type');
      loadDelResSearchForm(formObj);
    } else if (searchType === 'blacklistCustomer') {
      loadBLCustomerSearchForm(formObj);
    } else {
      logger('here in customer search type');
      loadCustomerSearchForm(formObj);
    }
  };

  const loadNewResForm = () => {
    loadFormOnAction();
    searchTypeNone();
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <NavBar logout={logout} userInfo={auth.user} />
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <>
          <FullPageLoader loading={loading} />
          <Snackbar
            open={snackBar.open}
            autoHideDuration={2000}
            onClose={closeSnackBar}
          >
            <Alert severity={snackBar.alert}>{snackBar.message}</Alert>
          </Snackbar>
          <MyForm
            open={formOpen}
            data={formData}
            type={formType}
            handleClose={closeForm2}
            action1={formAction1}
            action2={formAction2}
          />
          <Grid container direction="row" justify="space-evenly">
            <Grid item xs={7}>
              <Paper elevation={3}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Formik
                    initialValues={{
                      textQuery: '',
                      firstDate: moment(),
                      secondDate: moment().add('1', 'days'),
                      searchType: 'customer',
                      searchBy: 'BookingID',
                    }}
                    validate={(values) => {
                      const errors = {};
                      if (values.searchBy === 'BookingID') {
                        if (!values.textQuery) {
                          errors.textQuery = 'Required';
                        }
                        if (isNaN(values.textQuery)) {
                          errors.textQuery = 'Not a Valid BookingID';
                        }
                      }

                      if (values.searchBy === 'FirstName') {
                        if (!values.textQuery) {
                          errors.textQuery = 'Required';
                        }
                        if (!isNaN(values.textQuery)) {
                          errors.textQuery = 'Not a Name';
                        }
                      }

                      if (
                        values.searchBy === 'CheckInPeriod' ||
                        values.searchBy === 'CheckOutPeriod'
                      ) {
                        if (
                          moment(values.secondDate).isBefore(
                            moment(values.firstDate)
                          )
                        ) {
                          errors.searchBy =
                            'CheckOut can not be before CheckIn';
                        }
                      }

                      return errors;
                    }}
                    onSubmit={(values, { setSubmitting }) => {
                      const { textQuery } = values;
                      const start = moment(values.firstDate, 'LLLL').format(
                        'YYYY-MM-DD'
                      );
                      const end = moment(values.secondDate, 'LLLL').format(
                        'YYYY-MM-DD'
                      );
                      // formType = values.searchType;
                      if (values.searchType === 'customer') {
                        searchTypeCustomer();
                        if (values.searchBy === 'BookingID') {
                          searchCustByID(textQuery);
                        } else if (values.searchBy === 'FirstName') {
                          searchCustByName(textQuery);
                        } else if (values.searchBy === 'CheckInPeriod') {
                          searchCustByCheckIn(start, end);
                        } else {
                          searchCustByCheckOut(start, end);
                        }
                      } else if (values.searchType === 'reservation') {
                        searchTypeReservation();
                        if (values.searchBy === 'BookingID') {
                          searchReservationByID(textQuery);
                        } else if (values.searchBy === 'FirstName') {
                          searchReservationByName(textQuery);
                        } else if (values.searchBy === 'CheckInPeriod') {
                          searchReservationByCheckIn(start, end);
                        } else {
                          searchReservationByCheckOut(start, end);
                        }
                      } else if (values.searchType === 'BlackList') {
                        searchTypeBlackList();
                        if (values.searchBy === 'BookingID') {
                          searchBLCustByID(textQuery);
                        } else if (values.searchBy === 'FirstName') {
                          searchBLCustByName(textQuery);
                        } else {
                          snackBarFail(
                            `Cannot Search by ${values.searchBy} For BlackList`
                          );
                        }
                      } else {
                        searchTypeDelRes();
                        if (values.searchBy === 'BookingID') {
                          searchDelReservationByID(textQuery);
                        } else if (values.searchBy === 'FirstName') {
                          searchDelReservationByName(textQuery);
                        } else if (values.searchBy === 'CheckInPeriod') {
                          searchDelReservationByCheckIn(start, end);
                        } else {
                          searchDelReservationByCheckOut(start, end);
                        }
                      }

                      // if (mountedRef.current === true) {
                      setSubmitting(false);
                      // }
                    }}
                  >
                    {({ submitForm }) => (
                      <Form>
                        <Grid container justify="space-evenly">
                          <Grid item xs={5} className={classes.textField}>
                            <Field
                              fullWidth
                              component={TextField}
                              variant="outlined"
                              name="textQuery"
                              type="text"
                              label="BookingID/Name"
                            />
                          </Grid>

                          <Grid item xs={3} className={classes.textField}>
                            <Field
                              fullWidth
                              component={DatePicker}
                              name="firstDate"
                              label="Start"
                            />
                          </Grid>

                          <Grid item xs={3} className={classes.textField}>
                            <Field
                              fullWidth
                              component={DatePicker}
                              name="secondDate"
                              label="End"
                            />
                          </Grid>

                          <Grid item xs={4} className={classes.textField}>
                            <Field
                              component={TextField}
                              select
                              fullWidth
                              size="small"
                              name="searchType"
                              label="Search For"
                              variant="outlined"
                            >
                              <MenuItem value="customer">Customer</MenuItem>
                              <MenuItem value="reservation">
                                Reservation
                              </MenuItem>
                              <MenuItem value="delReservation">
                                Deleted Reservation
                              </MenuItem>
                              <MenuItem value="BlackList">BlackList</MenuItem>
                            </Field>
                          </Grid>

                          <Grid item xs={5} className={classes.textField}>
                            <Field
                              component={TextField}
                              select
                              fullWidth
                              size="small"
                              name="searchBy"
                              label="Search By"
                              variant="outlined"
                            >
                              <MenuItem value="BookingID">BookingID</MenuItem>
                              <MenuItem value="FirstName">First Name</MenuItem>
                              <MenuItem value="CheckInPeriod">
                                Check In Period
                              </MenuItem>
                              <MenuItem value="CheckOutPeriod">
                                Check Out Period
                              </MenuItem>
                            </Field>
                          </Grid>

                          <Grid item xs={2}>
                            <Button
                              variant="contained"
                              color="primary"
                              className={classes.newResButton}
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
              <RegTable
                resList={searchResult}
                handleOpen={loadSearchFormData}
              />
            </Grid>
            <Grid item xs={4}>
              <Paper elevation={3} style={{ marginTop: '1em' }}>
                <Calendar className={classes.calendar} />
              </Paper>
              <Divider />
              <Fab
                variant="extended"
                size="large"
                color="primary"
                className={classes.newResButton}
                onClick={loadNewResForm}
              >
                New Reservation
              </Fab>
            </Grid>
          </Grid>
        </>
      </main>
    </div>
  );
};

const mapStateToProps = (state) => ({
  auth: state.authState,
  searchResult: state.searchResultState.results,
  searchType: state.searchResultState.searchType,
  formOpen: state.formState.open,
  formData: state.formState.data,
  formType: state.formState.list,
  snackBar: state.snackBarState,
  loading: state.loadingState.isLoading,
});

const mapDispatchToProps = (dispatch) => ({
  logout: (redirect) => dispatch(logoutStaff(redirect)),
  createNewReservation: (resObj) => dispatch(createNewRes(resObj)),
  searchResultClose: () => dispatch(loadSearchResultFail()),

  searchReservationByID: (ID) => dispatch(searchResByID(ID)),
  searchReservationByName: (name) => dispatch(searchResFirstName(name)),
  searchReservationByCheckIn: (start, end) =>
    dispatch(searchResByCheckIn(start, end)),
  searchReservationByCheckOut: (start, end) =>
    dispatch(searchResByCheckOut(start, end)),

  searchDelReservationByID: (ID) => dispatch(searchDeleteResByID(ID)),
  searchDelReservationByName: (name) =>
    dispatch(searchDeleteResFirstName(name)),
  searchDelReservationByCheckIn: (start, end) =>
    dispatch(searchDeleteResByCheckIn(start, end)),
  searchDelReservationByCheckOut: (start, end) =>
    dispatch(searchDeleteResByCheckOut(start, end)),

  searchCustByID: (ID) => dispatch(searchCustomerByID(ID)),
  searchCustByName: (name) => dispatch(searchCustomerFirstName(name)),
  searchCustByCheckIn: (start, end) =>
    dispatch(searchCustomerByCheckIn(start, end)),
  searchCustByCheckOut: (start, end) =>
    dispatch(searchCustomerByCheckOut(start, end)),

  searchBLCustByName: (name) => dispatch(searchBlackListByFirstName(name)),
  searchBLCustByID: (ID) => dispatch(searchBlackListByID(ID)),

  loadFormOnAction: () => dispatch(loadForm()),
  loadResSearchForm: (data) => dispatch(loadSearchFormWithResData(data)),
  loadDelResSearchForm: (data) => dispatch(loadSearchFormWithDelData(data)),
  loadCustomerSearchForm: (data) => dispatch(loadSearchFormWithCustData(data)),
  loadBLCustomerSearchForm: (data) =>
    dispatch(loadSearchFormWithBLCustData(data)),

  searchTypeNone: () => dispatch(searchNone()),
  searchTypeReservation: () => dispatch(searchByReservation()),
  searchTypeDelRes: () => dispatch(searchByDelRes()),
  searchTypeCustomer: () => dispatch(searchByCustomer()),
  searchTypeBlackList: () => dispatch(searchByBlackListCustomer()),

  updateRes: (updatedRes) => dispatch(updateReservation(updatedRes)),
  updateCust: (updatedCust) => dispatch(updateCustomer(updatedCust)),
  updateDelRes: (updatedRes) => dispatch(updateDelReservation(updatedRes)),
  updateBLCust: (updatedBLCust) => dispatch(updateBlackListCust(updatedBLCust)),

  addBLCust: (newBLCust) => dispatch(addBlackListCust(newBLCust)),
  removeBLCust: (ID) => dispatch(removeBlackListCust(ID)),

  cancelRes: (ID) => dispatch(cancelReservation(ID)),
  permDelRes: (ID) => dispatch(permDelReservation(ID)),

  snackBarSucceed: (msg) => dispatch(snackBarSuccess(msg)),
  snackBarFailed: (msg) => dispatch(snackBarFail(msg)),
  closeForm: () => dispatch(loadFormFail()),
  closeSnackBar: () => dispatch(snackBarClose()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Query);

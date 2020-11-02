/**
 * Module Dependencies
 */
import React from 'react';
import moment from 'moment';

// MaterialUI Components and Icons
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Paper, Button, MenuItem } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import CssBaseline from '@material-ui/core/CssBaseline';

// Formik and formik-material-ui
import { Formik, Form, Field } from 'formik';

import { TextField } from 'formik-material-ui';

// REDUX
import { connect } from 'react-redux';

import { logoutStaff } from '../redux/thunks/authThunks';
import { generateTaxReport } from '../redux/thunks/reportThunks';

import {
  snackBarClose,
} from '../redux/actions/actions';

// Components
import NavBar from '../components/NavBar';
import FullPageLoader from '../components/FullPageLoader';

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
    // margin: theme.spacing(1, 1, 1),
    width: '100%',
  },
  input: {
    padding: theme.spacing(2, 0, 2),
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
const TaxReport = ({
  auth,
  snackBar,
  loading,
  closeSnackBar,
  generateTaxReportOnAction,
  logout,
}) => {
  const classes = useStyles();

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
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="center"
          >
            <Grid item xs={6}>
              <Paper elevation={3} className={classes.input}>
                <Formik
                  initialValues={{
                    MonthID: moment().month() + 1,
                    YearID: moment().year(),
                  }}
                  onSubmit={(values, { setSubmitting }) => {
                    generateTaxReportOnAction(values.MonthID, values.YearID);
                    setSubmitting(false);
                  }}
                >
                  {({ submitForm }) => (
                    <Form>
                      <Grid container justify="space-evenly">
                        <Grid item xs={5}>
                          <Field
                            component={TextField}
                            select
                            fullWidth
                            size="small"
                            name="MonthID"
                            label="Month"
                            variant="outlined"
                          >
                            <MenuItem value="1">January</MenuItem>
                            <MenuItem value="2">February</MenuItem>
                            <MenuItem value="3">March</MenuItem>
                            <MenuItem value="4">April</MenuItem>
                            <MenuItem value="5">May</MenuItem>
                            <MenuItem value="6">June</MenuItem>
                            <MenuItem value="7">July</MenuItem>
                            <MenuItem value="8">August</MenuItem>
                            <MenuItem value="9">September</MenuItem>
                            <MenuItem value="10">October</MenuItem>
                            <MenuItem value="11">November</MenuItem>
                            <MenuItem value="12">December</MenuItem>
                          </Field>
                        </Grid>
                        <Grid item xs={2}>
                          <Field
                            component={TextField}
                            select
                            fullWidth
                            size="small"
                            name="YearID"
                            label="Year"
                            variant="outlined"
                          >
                            <MenuItem value="2020">2020</MenuItem>
                            <MenuItem value="2021">2021</MenuItem>
                            <MenuItem value="2022">2022</MenuItem>
                          </Field>
                        </Grid>
                        <Grid item xs={3}>
                          <Button
                            variant="contained"
                            color="primary"
                            className={classes.newResButton}
                            onClick={submitForm}
                          >
                            Generate
                          </Button>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              </Paper>
            </Grid>
          </Grid>
        </>
      </main>
    </div>
  );
};

const mapStateToProps = (state) => ({
  auth: state.authState,
  snackBar: state.snackBarState,
  loading: state.loadingState.isLoading,
});

const mapDispatchToProps = (dispatch) => ({
  logout: (redirect) => dispatch(logoutStaff(redirect)),
  generateTaxReportOnAction: (MonthID, YearID) => dispatch(generateTaxReport(MonthID, YearID)),
  closeSnackBar: () => dispatch(snackBarClose()),
});

export default connect(mapStateToProps, mapDispatchToProps)(TaxReport);

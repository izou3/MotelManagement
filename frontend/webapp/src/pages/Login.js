/**
 * Modular Dependencies
 */
import React from 'react';
import { withRouter, useHistory } from 'react-router-dom';

// MaterialUI Components and Icons
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Grid } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

// Formik and formik-material-ui
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';

/**
 * Redux Dependencies
 */
import { connect } from 'react-redux';

import { loginStaff } from '../redux/thunks/authThunks';

// Actions
import {
  snackBarClose,
  snackBarFail,
  snackBarSuccess,
  showLoading,
  hideLoading,
} from '../redux/actions/actions';

// Components
import FullPageLoader from '../components/FullPageLoader';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  input: {
    marginTop: theme.spacing(2),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

/**
 * Stateless Component to Render the CopyRight Info
 */
function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://bigskylodge.com/">
        Big Sky Lodge
      </Link>
      {' '}
      {new Date().getFullYear()}
    </Typography>
  );
}

/**
 * Stateless Component to Render MaterialUI Alert
 */
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

/**
 * Login Component to Render the Login Page
 * @param {Object} param authenticated user state and actions
 */
const Login = ({
  snackBar,
  loading,
  isAuth,
  authUser,

  login,
  closeSnackBar,
  snackBarSucceed,
  load,
  hideLoad,
}) => {
  const classes = useStyles();
  const history = useHistory();

  React.useEffect(() => {
    if (isAuth) {
      if (authUser.position < 2) history.push('/');
      else history.push('/staff/housekeeping');
    }
  });

  function redirectAfterLoginSuccess(userInfo) {
    if (userInfo.position < 2) {
      history.push('/staff/');
    } else if (userInfo.position === 2) {
      history.push('/staff/housekeeping');
    }
  }

  return (
    <>
      <FullPageLoader loading={loading} />
      <Snackbar
        open={snackBar.open}
        autoHideDuration={2000}
        onClose={closeSnackBar}
      >
        <Alert severity={snackBar.alert}>{snackBar.message}</Alert>
      </Snackbar>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Formik
            initialValues={{
              username: '',
              password: '',
            }}
            validate={(values) => {
              const errors = {};
              if (values.username.trim().length === 0) {
                errors.username = 'Required';
              }

              if (values.password.trim().length === 0) {
                errors.password = 'Required';
              }

              return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {
              setSubmitting(true);
              login(values, redirectAfterLoginSuccess);
              setSubmitting(false);
            }}
          >
            {({ submitForm }) => (
              <Form className={classes.form}>
                <Field
                  fullWidth
                  component={TextField}
                  variant="outlined"
                  type="text"
                  label="Username"
                  name="username"
                  placeholder="Username"
                />
                <Field
                  className={classes.input}
                  fullWidth
                  component={TextField}
                  variant="outlined"
                  type="password"
                  label="Password"
                  name="password"
                  placeholder="Password"
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={submitForm}
                  className={classes.submit}
                >
                  Login
                </Button>
                <Grid item xs>
                  <Link href="/" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
              </Form>
            )}
          </Formik>
        </div>
        <Box mt={8}>
          <Copyright />
        </Box>
      </Container>
    </>
  );
};

const mapStateToProps = (state) => ({
  snackBar: state.snackBarState,
  loading: state.loadingState.isLoading,
  isAuth: state.authState.isAuthenticated,
  authUser: state.authState.user,
});

const mapDispatchToProps = (dispatch) => ({
  login: (userInfo, redirect) => dispatch(loginStaff(userInfo, redirect)),
  snackBarSucceed: (msg) => dispatch(snackBarSuccess(msg)),
  snackBarFailed: (msg) => dispatch(snackBarFail(msg)),
  closeSnackBar: () => dispatch(snackBarClose()),
  load: () => dispatch(showLoading()),
  hideLoad: () => dispatch(hideLoading()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Login));

/* eslint-disable no-nested-ternary */
/**
 * Module Dependencies
 */
import React from 'react';
import moment from 'moment';

// MaterialUI Components
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Button, MenuItem } from '@material-ui/core';

// Formik and formik-material-ui Components
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import { DatePicker } from 'formik-material-ui-pickers';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import logger from '../logger';

const useStyles = makeStyles((theme) => ({
  textField: {
    margin: theme.spacing(0, 0, 2),
  },
  textField2: {
    margin: theme.spacing(2, 0, 0),
  },
}));

/**
 * Action Buttons to Render on Form Given the form State
 * @param {Number} props.type The Type of Form that is Loaded
 */
const FormActions = (props) => {
  const { isSubmitting } = props;
  const { type } = props;
  let hidden1 = 'none';
  let hidden2 = 'none';
  let hidden3 = 'none';
  let button1 = '';
  let button2 = '';
  let button3 = '';

  if (type === 0) {
    button1 = 'New Reservation';
    button2 = '';
    button3 = '';
    hidden1 = '';
    hidden2 = 'none';
    hidden3 = 'none';
  } else if (type === 1) {
    button1 = 'Update';
    button2 = 'Check-Out';
    button3 = 'Move to Arrivals';
    hidden1 = '';
    hidden2 = '';
    hidden3 = '';
  } else if (type === 2) {
    button1 = 'Update';
    button2 = 'Check-In';
    button3 = 'Move to Over';
    hidden1 = '';
    hidden2 = '';
    hidden3 = '';
  } else if (type === 3) {
    button1 = '';
    button2 = 'Delete';
    button3 = 'Move to Arrivals';
    hidden1 = 'none';
    hidden2 = '';
    hidden3 = '';
  } else if (type === 6) {
    button1 = 'Update';
    button2 = 'Blacklist';
    hidden1 = '';
    hidden2 = '';
    hidden3 = 'none';
  } else if (type === 7) {
    button1 = 'Update';
    button2 = 'Remove from Blacklist';
    hidden1 = '';
    hidden2 = '';
    hidden3 = 'none';
  } else if (type === 8) {
    button2 = 'Update';
    button3 = 'Remove';
    hidden1 = 'none';
    hidden2 = '';
    hidden3 = '';
  } else if (type === 9) {
    button1 = 'Create New Staff';
    hidden1 = '';
    hidden2 = 'none';
    hidden3 = 'none';
  } else if (type === 10) {
    button1 = 'Add To BlackList';
    hidden1 = '';
    hidden2 = 'none';
    hidden3 = 'none';
  } else {
    button1 = 'Update';
    button2 = 'Delete';
    hidden1 = '';
    hidden2 = '';
    hidden3 = 'none';
  }

  return (
    <>
      <Box display={hidden1}>
        <Button
          variant="contained"
          color="primary"
          value="button1"
          disabled={isSubmitting}
          onClick={() => props.handleForm('action1', props.submitForm)}
        >
          {button1}
        </Button>
      </Box>
      <Box display={hidden2}>
        <Button
          variant="contained"
          color="primary"
          value="button2"
          disabled={isSubmitting}
          onClick={() => props.handleForm('action2', props.submitForm)}
        >
          {button2}
        </Button>
      </Box>
      <Box display={hidden3}>
        <Button
          variant="contained"
          value="button3"
          color="primary"
          disabled={isSubmitting}
          onClick={() => props.handleForm('action3', props.submitForm)}
        >
          {button3}
        </Button>
      </Box>
    </>
  );
};

/**
 * Stateless Component of the Form that is Rendered
 * @param {Object} props.data The data that the form will render/contain
 * @param {Number} props.type The Type of Form to be rendered
 * @param {Boolean} props.open Whether the form should be rendered or not
 */
const ResForm = (props) => {
  const classes = useStyles();

  // State that determies which button was pressed
  const [actionType, setActionType] = React.useState('none');

  const { data } = props;
  const { type } = props;
  const { open } = props;
  const { roomList } = props;

  const handleClose = () => {
    props.handleClose();
  };

  const handleSubmit = (formType, submitHandler) => {
    if (formType === 'action1') {
      setActionType('action1');
    } else if (formType === 'action2') {
      setActionType('action2');
    } else if (formType === 'action3') {
      setActionType('action3');
    } else {
      setActionType('none'); // default action type
    }
    submitHandler();
  };

  const formTitle = () => {
    let returnString = '';
    if (type === 0) {
      returnString = 'New Reservation';
    } else if (type === 8) {
      returnString = `${data.firstName} ${data.lastName}`;
    } else if (type === 9) {
      returnString = `New Staff`;
    } else if (type === 10) {
      returnString = 'New BlackList for Guests who not stayed Before';
    } else {
      returnString = data ? `BookingID: ${data.BookingID}` : null;
    }
    return returnString;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md">
      <DialogTitle>{formTitle()}</DialogTitle>
      {type === 7 ? (
        <>
          <Formik
            initialValues={{
              CustomerID: data.CustomerID,
              firstName: data.firstName,
              lastName: data.lastName,
              comments: data.comments,
            }}
            validate={(values) => {
              const errors = {};

              if (values.comments.length > 245) {
                errors.comments = 'Must be less than 245 characters';
              }

              return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {
              if (actionType === 'action1') {
                props.action1(values);
              } else if (actionType === 'action2') {
                props.action2(values);
              }

              setSubmitting(false);
            }}
          >
            {({ submitForm, isSubmitting }) => (
              <Form>
                <DialogContent>
                  <Grid container justify="space-evenly">
                    <Grid item xs={5} className={classes.textField}>
                      <Field
                        fullWidth
                        disabled
                        component={TextField}
                        variant="outlined"
                        name="firstName"
                        type="text"
                        label="First Name"
                      />
                    </Grid>
                    <Grid item xs={5} className={classes.textField}>
                      <Field
                        fullWidth
                        disabled
                        component={TextField}
                        variant="outlined"
                        name="lastName"
                        type="text"
                        label="Last Name"
                      />
                    </Grid>
                    <Grid item xs={11} className={classes.textField}>
                      <Field
                        fullWidth
                        component={TextField}
                        variant="outlined"
                        name="comments"
                        type="text"
                        label="Comments"
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <FormActions
                    submitForm={submitForm}
                    handleForm={handleSubmit}
                    isSubmitting={isSubmitting}
                    type={type}
                  />
                </DialogActions>
              </Form>
            )}
          </Formik>
        </>
      ) : type === 8 || type === 9 ? (
        <>
          <Formik
            initialValues={{
              firstName: data.firstName ? data.firstName : '',
              password: data.password ? data.password : '',
              lastName: data.lastName ? data.lastName : '',
              position: data.position ? data.position : 0,
              email: data.email ? data.email : '',
              username: data.username ? data.username : '',
            }}
            validate={(values) => {
              const errors = {};

              if (type === 9) {
                if (!values.username || values.username.trim().length === 0) {
                  errors.username = 'Username is Required';
                } else if (values.username.trim().length > 20) {
                  errors.username = 'Username Too Long';
                }

                if (!values.password || values.password.trim().length === 0) {
                  errors.password = 'Password is Required';
                } else if (values.password.trim().length < 8) {
                  errors.password = 'Password is Too Short';
                } else if (values.password.trim().length > 25) {
                  errors.password = 'Password is Too Long';
                }
              }

              if (values.firstName.trim().length === 0) {
                errors.firstName = 'First Name Cannot be Blank';
              } else if (values.firstName.trim().length > 20) {
                errors.firstName = 'Use a Shorter Name';
              }

              if (values.lastName.trim().length === 0) {
                errors.lastName = 'First Name Cannot be Blank';
              } else if (values.lastName.trim().length > 20) {
                errors.lastName = 'Use a Shorter Name';
              }

              if (values.email.trim().length === 0) {
                errors.email = 'Email Cannot Be Blank';
              } else if (values.email.trim().length > 40) {
                errors.email = 'Email is too Long';
              } else if (
                !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
              ) {
                errors.email = 'Invalid email address';
              }

              return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {
              if (actionType === 'action1') {
                logger('Create Staff');
                props.action1(values);
              } else if (actionType === 'action2') {
                logger('Update Staff');
                // eslint-disable-next-line no-param-reassign
                delete values.password;
                logger(values);
                props.action2(values);
              } else if (actionType === 'action3') {
                logger('Delete Staff');
                props.action3(values.username);
              }
              setSubmitting(false);
            }}
          >
            {({ submitForm, isSubmitting }) => (
              <Form>
                <DialogContent>
                  <Grid container justify="space-evenly">
                    {
                      // Render New Form
                      !data.username && (
                        <>
                          <Grid item xs={5} className={classes.textField}>
                            <Field
                              fullWidth
                              component={TextField}
                              variant="outlined"
                              name="username"
                              type="text"
                              label="Username"
                            />
                          </Grid>
                          <Grid item xs={5} className={classes.textField}>
                            <Field
                              fullWidth
                              component={TextField}
                              variant="outlined"
                              name="password"
                              type="password"
                              label="Password"
                            />
                          </Grid>
                        </>
                      )
                    }

                    <Grid item xs={5} className={classes.textField}>
                      <Field
                        fullWidth
                        component={TextField}
                        variant="outlined"
                        name="firstName"
                        type="text"
                        label="firstName"
                      />
                    </Grid>
                    <Grid item xs={5} className={classes.textField}>
                      <Field
                        component={TextField}
                        fullWidth
                        name="lastName"
                        label="Last Name"
                        variant="outlined"
                      />
                    </Grid>

                    <Grid item xs={3} className={classes.textField}>
                      <Field
                        component={TextField}
                        select
                        fullWidth
                        name="position"
                        label="Position"
                        variant="outlined"
                      >
                        <MenuItem value={0}>Owner</MenuItem>
                        <MenuItem value={1}>Manager</MenuItem>
                        <MenuItem value={2}>Housekeeper</MenuItem>
                      </Field>
                    </Grid>

                    <Grid item xs={7} className={classes.textField}>
                      <Field
                        component={TextField}
                        fullWidth
                        name="email"
                        label="email"
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <FormActions
                    submitForm={submitForm}
                    handleForm={handleSubmit}
                    isSubmitting={isSubmitting}
                    type={type}
                  />
                </DialogActions>
              </Form>
            )}
          </Formik>
        </>
      ) : (
        <>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Formik
              initialValues={{
                firstName: data.firstName ? data.firstName : '',
                lastName: data.lastName ? data.lastName : '',
                ReservationID: data.ReservationID ? data.ReservationID : 0,
                PaymentID: data.PaymentID ? data.PaymentID : 0,
                RoomID: data.RoomID ? data.RoomID : '',
                StateID: data.StateID ? data.StateID : '',
                StyleID: data.StyleID ? data.StyleID : 0,
                pricePaid: data.pricePaid ? data.pricePaid : '',
                tax: data.tax ? data.tax : '',
                checkIn: data.checkIn
                  ? moment(data.checkIn).format()
                  : moment().format(),
                checkOut: data.checkOut
                  ? moment(data.checkOut).format()
                  : moment().add(1, 'days').format(),
                numGuests: data.numGuests ? data.numGuests : '',
                email: data.email ? data.email : '',
                phone: data.phone ? data.phone : '',
                comments: data.comments ? data.comments : '',
              }}
              validate={(values) => {
                const errors = {};

                if (!values.firstName) {
                  errors.firstName = 'Required';
                } else if (values.firstName.trim().length > 20) {
                  errors.firstName = 'Must be 15 characters or less';
                }

                if (!values.lastName) {
                  errors.lastName = 'Required';
                } else if (values.lastName.trim().length > 20) {
                  errors.lastName = 'Must be 20 characters or less';
                }

                if (!values.numGuests) {
                  errors.numGuests = 'Required';
                } else if (isNaN(values.numGuests)) {
                  errors.numGuests = 'Must be a Number';
                } else if (values.numGuests > 10) {
                  errors.numGuests = 'Too Much!!';
                }

                if (values.email) {
                  if (
                    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(
                      values.email
                    )
                  ) {
                    errors.email = 'Invalid email address';
                  } else if (values.email.length > 48) {
                    errors.email = 'Must be 48 characters or less';
                  }
                }

                if (values.phone) {
                  if (values.phone.length < 10 || values.phone.length > 10) {
                    errors.phone = "Number isn't 10 digits";
                  }
                }

                if (values.StateID) {
                  if (values.StateID.length > 2) {
                    errors.StateID = 'Abbreviate';
                  }
                }

                if (
                  moment(values.checkIn).isSameOrAfter(moment(values.checkOut))
                ) {
                  errors.pricePaid = "Check Out Can't be before Check In";
                }

                if (!values.pricePaid) {
                  errors.pricePaid = 'Required';
                } else if (isNaN(values.pricePaid)) {
                  errors.pricePaid = 'Not a price';
                }

                if (!values.tax) {
                  errors.tax = 'Required';
                } else if (isNaN(values.tax)) {
                  errors.tax = 'Not a tax';
                }

                if (!values.RoomID) {
                  errors.RoomID = 'Required';
                } else if (isNaN(values.RoomID)) {
                  errors.RoomID = 'Not a Number';
                } else if (values.RoomID > 127 || values.RoomID < 101) {
                  errors.RoomID = 'Not a Room';
                }

                if (values.comments.length > 245) {
                  errors.comments = 'Must be less than 245 characters';
                }

                return errors;
              }}
              onSubmit={(values, { setSubmitting }) => {
                setSubmitting(true);

                if (actionType === 'action1') {
                  props.action1(
                    {
                      ...data,
                      ...values,
                    },
                    data.RoomID
                  );
                } else if (actionType === 'action2') {
                  props.action2({
                    ...data,
                    ...values,
                  });
                } else if (actionType === 'action3') {
                  props.action3(
                    {
                      ...data,
                      ...values,
                    },
                    data.RoomID
                  );
                }

                setSubmitting(false);
              }}
            >
              {({ submitForm, isSubmitting }) => (
                <Form>
                  <DialogContent>
                    <Grid container justify="space-evenly">
                      <Grid item xs={5} className={classes.textField}>
                        <Field
                          disabled={type === 6}
                          fullWidth
                          component={TextField}
                          variant="outlined"
                          name="firstName"
                          type="text"
                          label="First Name"
                        />
                      </Grid>

                      <Grid item xs={5} className={classes.textField}>
                        <Field
                          disabled={type === 6}
                          component={TextField}
                          fullWidth
                          name="lastName"
                          label="Last Name"
                          variant="outlined"
                        />
                      </Grid>

                      <Grid item xs={1} className={classes.textField}>
                        <Field
                          component={TextField}
                          fullWidth
                          name="numGuests"
                          label="Guests"
                          variant="outlined"
                        />
                      </Grid>

                      <Grid item xs={5} className={classes.textField}>
                        <Field
                          component={TextField}
                          fullWidth
                          id="email"
                          name="email"
                          label="Email"
                          variant="outlined"
                        />
                      </Grid>

                      <Grid item xs={4} className={classes.textField}>
                        <Field
                          component={TextField}
                          fullWidth
                          id="phone"
                          name="phone"
                          label="phone"
                          variant="outlined"
                        />
                      </Grid>

                      <Grid item xs={2} className={classes.textField}>
                        <Field
                          component={TextField}
                          fullWidth
                          id="StateID"
                          name="StateID"
                          label="State"
                          variant="outlined"
                        />
                      </Grid>

                      <Grid item xs={3} className={classes.textField}>
                        <Field
                          component={DatePicker}
                          fullWidth
                          name="checkIn"
                          label="Check In"
                        />
                      </Grid>

                      <Grid item xs={3} className={classes.textField}>
                        <Field
                          component={DatePicker}
                          fullWidth
                          name="checkOut"
                          label="Check Out"
                        />
                      </Grid>

                      <Grid item xs={3} className={classes.textField}>
                        <Field
                          component={TextField}
                          select
                          fullWidth
                          name="ReservationID"
                          label="Reservation"
                          variant="outlined"
                        >
                          <MenuItem value={0}>Booking.com</MenuItem>
                          <MenuItem value={1}>Expedia Partners</MenuItem>
                          <MenuItem value={2}>Phone Call</MenuItem>
                          <MenuItem value={3}>Walk-In</MenuItem>
                          <MenuItem value={4}>Others</MenuItem>
                        </Field>
                      </Grid>

                      <Grid item xs={2} className={classes.textField}>
                        <Field
                          component={TextField}
                          select
                          fullWidth
                          label="Payment"
                          name="PaymentID"
                          variant="outlined"
                        >
                          <MenuItem value={0}>Card</MenuItem>
                          <MenuItem value={1}>Cash</MenuItem>
                          <MenuItem value={2}>Check</MenuItem>
                          <MenuItem value={3}>Other</MenuItem>
                        </Field>
                      </Grid>

                      <Grid item xs={3} className={classes.textField}>
                        <Field
                          fullWidth
                          component={TextField}
                          name="pricePaid"
                          label="Total Price"
                          variant="outlined"
                          margin="normal"
                        />
                      </Grid>

                      <Grid item xs={3} className={classes.textField}>
                        <Field
                          fullWidth
                          component={TextField}
                          name="tax"
                          label="Tax"
                          variant="outlined"
                          margin="normal"
                        />
                      </Grid>

                      <Grid item xs={2} className={classes.textField2}>
                        <Field
                          component={TextField}
                          select
                          fullWidth
                          label="Room"
                          name="RoomID"
                          variant="outlined"
                        >
                          {roomList.map((room, index) => (
                            <MenuItem key={room} value={index + 101}>
                              {room}
                            </MenuItem>
                          ))}
                        </Field>
                      </Grid>

                      <Grid item xs={3} className={classes.textField2}>
                        <Field
                          component={TextField}
                          select
                          fullWidth
                          label="Room Style"
                          name="StyleID"
                          variant="outlined"
                        >
                          <MenuItem value={0}>Single Queen</MenuItem>
                          <MenuItem value={1}>Single King</MenuItem>
                          <MenuItem value={2}>Double Queen</MenuItem>
                          <MenuItem value={3}>Kitchnette</MenuItem>
                          <MenuItem value={4}>Triple Queen</MenuItem>
                        </Field>
                      </Grid>

                      <Grid item xs={12} className={classes.textField}>
                        <Field
                          fullWidth
                          component={TextField}
                          multiline
                          rowsMax={4}
                          name="comments"
                          label="comments"
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <FormActions
                      submitForm={submitForm}
                      handleForm={handleSubmit}
                      isSubmitting={isSubmitting}
                      type={type}
                    />
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </MuiPickersUtilsProvider>
        </>
      )}
    </Dialog>
  );
};

export default ResForm;

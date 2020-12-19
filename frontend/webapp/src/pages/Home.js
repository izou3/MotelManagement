/**
 * Modular Imports
 */
import React from 'react';

// MaterialUI Components
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Card, Grid, Box, Paper, Divider } from '@material-ui/core';
import CardContent from '@material-ui/core/CardContent';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import CssBaseline from '@material-ui/core/CssBaseline';

// Calender
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Dashboard Components
import { connect } from 'react-redux';
import { batchActions } from 'redux-batched-actions';
import NavBar from '../components/NavBar';
import FullPageLoader from '../components/FullPageLoader';
import Form from '../components/Form';
import RegTable from '../components/tables/RegTable';
import PageTable from '../components/tables/PageTable';

// Redux Components
import { snackBarClose } from '../redux/actions/actions';

// Socket Actions for Form Notification
import {
  socketLoadForm,
  socketLoadPendingForm,
  socketLoadOverForm,
} from '../redux/actions/socket/form';

// Actions
import {
  loadFormFail,
  loadFormWithRoom,
  loadCurFormWithData,
  loadPendFormWithData,
  loadOverFormWithData,
} from '../redux/actions/formActions';

// Thunks
import {
  createNewRes,
  updateCurrRes,
  moveCurrRes,
  deleteCurrRes,
  checkInRes,
  checkOutRes,
} from '../redux/thunks/reservationThunks';

import { logoutStaff } from '../redux/thunks/authThunks';

import { getCurrRes, getPendRes, getOverRes } from '../redux/selectors';

// Debug Logger
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
  dailySummary: {
    margin: theme.spacing(0, 1, 0),
    textAlign: 'center',
    width: '30%',
    header: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
    },
  },
  calendar: {
    width: 'auto',
    border: 'none',
    borderRadius: '5px',
  },
  tableMargin: {
    marginRight: '3rem',
  },
  loadContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#F8F8F8AD',
  },
  loader: {
    left: '50%',
    top: '30%',
    zIndex: '1000',
    position: 'absolute',
  },
  divider: {
    margin: theme.spacing(4, 0, 0),
  },
}));

/**
 * Stateless Component to Render MaterialUI Alert
 */
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

/**
 * Home Page Component that Renders Main Dashboard
 * @param {Object} param Redux State, Actions, and Thunks
 */
const Home = ({
  auth,
  info,
  currRes,
  pendRes,
  overRes,
  motelRoomList,
  logout,
  createNewCurrentReservation,
  updateCurrentRes,
  deleteCurrentReservation,
  moveCurrentReservation,
  checkInReservation,
  checkOutReservation,
  formOpen,
  formData,
  formType,
  openNewFormRoom,
  openCurrForm,
  openPendForm,
  openOverForm,
  closeForm,
  snackBar,
  closeSnackBar,
  loading,
}) => {
  const classes = useStyles();

  const loadFormOnAction = (room, checked, BookingID = 0) => {
    let formObj = {};
    if (checked === 2) {
      formObj = pendRes.find((obj) => obj.BookingID === BookingID);
      openPendForm(formObj);
    } else if (checked === 0) {
      formObj = overRes.find((obj) => obj.BookingID === BookingID);
      openOverForm(formObj);
    } else {
      formObj = currRes[room - 101];
      if (formObj.BookingID) {
        openCurrForm(formObj);
      } else {
        logger(room);
        openNewFormRoom({ RoomID: room });
      }
    }
  };

  const closeForm2 = () => closeForm();

  const formAction1 = (resObj, prevRoom) => {
    if (resObj.BookingID) {
      // Updating a reservation
      logger('updating reservation');
      updateCurrentRes(resObj, prevRoom);
    } else {
      // creating a new reservation with checked=1
      logger('creating new reservation');
      createNewCurrentReservation({ ...resObj, Checked: 1 });
    }
  };

  const formAction2 = (dataRes) => {
    if (formType === 1) {
      logger('check out guest');
      checkOutReservation(dataRes);
    } else if (formType === 2) {
      logger('check in guest');
      checkInReservation(dataRes);
    } else if (formType === 3) {
      logger('delete reservation');
      deleteCurrentReservation(dataRes.BookingID);
    } else {
      logger('no action');
    }
  };

  const formAction3 = (dataRes, prevRoom) => {
    if (formType === 1) {
      logger('move to arrivals from current');
      moveCurrentReservation(
        { ...dataRes, Checked: 2 },
        prevRoom,
        'current',
        'arrival'
      );
    } else if (formType === 2) {
      logger('move to Over from arrivals');
      moveCurrentReservation(
        { ...dataRes, Checked: 0 },
        prevRoom,
        'arrival',
        'over'
      );
    } else if (formType === 3) {
      logger('move to arrivals from over');
      moveCurrentReservation(
        { ...dataRes, Checked: 2 },
        prevRoom,
        'over',
        'arrival'
      );
    } else {
      logger('no action');
    }
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <NavBar logout={logout} userInfo={auth.user} motelInfo={auth.motel} />
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <>
          <FullPageLoader loading={loading} />
          <Snackbar
            open={snackBar.open}
            autoHideDuration={10000}
            onClose={closeSnackBar}
          >
            <Alert severity={snackBar.alert}>{snackBar.message}</Alert>
          </Snackbar>
          <Form
            open={formOpen}
            data={formData}
            type={formType}
            roomList={motelRoomList}
            handleClose={closeForm2}
            action1={formAction1}
            action2={formAction2}
            action3={formAction3}
          />
          <Grid container>
            <Grid item xs={6} className={classes.tableMargin}>
              <RegTable
                roomList={motelRoomList}
                resList={currRes}
                handleOpen={loadFormOnAction}
              />
            </Grid>
            <Grid item xs={5}>
              <Box display="flex" flexWrap="nowrap">
                <Card className={classes.dailySummary}>
                  <header>
                    <Typography variant="button" display="block">
                      StayOvers
                    </Typography>
                  </header>
                  <Divider />
                  <CardContent>
                    <Typography variant="h6">{info.Stayovers}</Typography>
                  </CardContent>
                </Card>
                <Card className={classes.dailySummary}>
                  <Typography variant="button" display="block">
                    Check-In
                  </Typography>
                  <Divider />
                  <CardContent>
                    <Typography variant="h6">{info.CheckIn}</Typography>
                  </CardContent>
                </Card>
                <Card className={classes.dailySummary}>
                  <Typography variant="button" display="block">
                    Available
                  </Typography>
                  <Divider />
                  <CardContent>
                    <Typography variant="h6">{info.Available}</Typography>
                  </CardContent>
                </Card>
              </Box>
              <Paper elevation={3} style={{ marginTop: '1em' }}>
                <Calendar className={classes.calendar} />
              </Paper>
              <Divider className={classes.divider} />
              <Typography variant="h6" align="center">
                48 HOUR ARRIVALS
              </Typography>
              <Divider />
              <Paper>
                <PageTable resList={pendRes} handleOpen={loadFormOnAction} />
              </Paper>
              <Divider className={classes.divider} />
              <Typography variant="h6" align="center">
                OVERDUE RESERVATIONS
              </Typography>
              <Divider />
              <Paper>
                <PageTable resList={overRes} handleOpen={loadFormOnAction} />
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
  motelRoomList: state.authState.motelRooms,
  info: state.info,
  currRes: getCurrRes(state),
  pendRes: getPendRes(state),
  overRes: getOverRes(state),
  formOpen: state.formState.open,
  formData: state.formState.data,
  formType: state.formState.list,
  snackBar: state.snackBarState,
  loading: state.loadingState.isLoading,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  createNewCurrentReservation: (resData) => dispatch(createNewRes(resData)),

  updateCurrentRes: (updatedRes, prevRoomID) =>
    dispatch(updateCurrRes(updatedRes, prevRoomID)),

  moveCurrentReservation: (dataRes, prevRoom, origin, destination) =>
    dispatch(moveCurrRes(dataRes, prevRoom, origin, destination)),

  deleteCurrentReservation: (BookingID, dataRes) =>
    dispatch(deleteCurrRes(BookingID, dataRes)),

  checkInReservation: (resObj) => dispatch(checkInRes(resObj)),
  checkOutReservation: (resObj) => dispatch(checkOutRes(resObj)),

  openNewFormRoom: (room) =>
    dispatch(
      batchActions([
        loadFormWithRoom(room),
        socketLoadForm(ownProps.user, room.RoomID),
      ])
    ),
  openCurrForm: (resData) =>
    dispatch(
      batchActions([
        loadCurFormWithData(resData),
        socketLoadForm(ownProps.user, resData.RoomID),
      ])
    ),
  openPendForm: (resData) =>
    dispatch(
      batchActions([
        loadPendFormWithData(resData),
        socketLoadPendingForm(ownProps.user, resData),
      ])
    ),
  openOverForm: (resData) =>
    dispatch(
      batchActions([
        loadOverFormWithData(resData),
        socketLoadOverForm(ownProps.user, resData),
      ])
    ),

  closeForm: () => dispatch(loadFormFail()),
  closeSnackBar: () => dispatch(snackBarClose()),
  logout: (redirect) => dispatch(logoutStaff(redirect)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);

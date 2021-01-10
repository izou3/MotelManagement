import Axios from 'axios'; // for Axios.all Requests which wont use axios.create
import moment from 'moment';
import { batchActions } from 'redux-batched-actions';

// Config
import config from '../../config';
import axios from './axios';

// Actions
import {
  loadResFail,
  loadCurrResSuccess,
  loadPendResSuccess,
  loadOverResSuccess,
  snackBarFail,
  snackBarSuccess,
  showLoading,
  hideLoading,
  updateStayOvers,
  updateAvailable,
  updateCheckIn,
} from '../actions/actions';

import { logoutUser } from '../actions/authActions';

import { loadReport, loadHouseKeepingReport } from '../actions/reportActions';

const Config = config[process.env.NODE_ENV || 'development'];

const initialPageLoad = (date) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      const reservationRequest = axios.get(
        `${Config.apiHost}/api/reservation/CurrReservation?HotelID=${HotelID}`,
        { withCredentials: true }
      );
      const reportRequest = axios.get(
        `${Config.apiHost}/api/dailyreport?HotelID=${HotelID}&date=${date}`,
        { withCredentials: true }
      );

      // Use separate Axios instance in order to use Axios.all requests. Otherwise
      // axio.create(...).all(...) will throw an error.
      return Axios.all([reservationRequest, reportRequest])
        .then(
          Axios.spread((...responses) => {
            const reservations = responses[0];
            const report = responses[1];

            // Sort Reservations
            const current = [];
            const pending = [];
            const overdue = [];
            reservations.data.forEach((reservation) => {
              if (reservation.Checked === 0) {
                // overdue
                overdue.push(reservation);
              } else if (reservation.Checked === 1) {
                // currently in room
                current[reservation.RoomID - 101] = reservation;
              } else {
                // is checking in today
                pending.push(reservation);
              }
            });

            // Number of Available Rooms
            let available = 0;

            const currentRes = [];

            // Get Total Number of Rooms
            const TotalRooms = state.authState.motelRooms.length;

            for (let i = 0; i < TotalRooms; i++) {
              if (current[i] && current[i].RoomID === i + 101) {
                currentRes[i] = current[i];
                currentRes[i]._id = undefined;
              } else {
                available++;
                currentRes[i] = {
                  RoomID: i + 101,
                };
              }
            }

            // Load Daily Report
            const stays = report.data.Stays;
            const refund = report.data.Refund;
            const reportData = [];
            const houseKeepingData = [];

            Object.entries(stays).forEach(([key, value]) => {
              if (key === '_id' || key === '126') {
                return;
              }
              // Get Rid of ID from Mongo Document
              reportData.push({
                BookingID: value.Room.BookingID ? value.Room.BookingID : 0,
                RoomID: key,
                type: value.Room.type,
                startDate: value.Room.startDate
                  ? moment(value.Room.startDate.substring(0, 10)).toDate()
                  : '',
                endDate: value.Room.endDate
                  ? moment(value.Room.endDate.substring(0, 10)).toDate()
                  : '',
                paid: !!value.Room.paid,
                rate: value.Room.rate ? value.Room.rate : '',
                tax: value.Room.tax ? value.Room.tax : '',
                notes: value.Room.notes ? value.Room.notes : '',
                payment: value.Room.payment ? value.Room.payment : '',
                initial: value.Room.initial ? value.Room.initial : '',
              });

              // HouseKeeping Report
              houseKeepingData.push({
                RoomID: key,
                status: value.HouseKeeping.status
                  ? value.HouseKeeping.status
                  : 'C',
                type: value.HouseKeeping.type ? value.HouseKeeping.type : 'W',
                houseKeeper: value.HouseKeeping.houseKeeper
                  ? value.HouseKeeping.houseKeeper
                  : '',
                notes: value.HouseKeeping.notes ? value.HouseKeeping.notes : '',
              });
            });

            dispatch(
              batchActions([
                loadReport(date, reportData, refund),
                loadHouseKeepingReport(date, houseKeepingData),
                updateStayOvers(25 - available),
                updateAvailable(available),
                updateCheckIn(pending.length),
                loadCurrResSuccess(currentRes),
                loadPendResSuccess(pending),
                loadOverResSuccess(overdue),
                snackBarSuccess('Loaded Reports Successfully'),
                hideLoading(),
              ])
            );
          })
        )
        .catch(() => {
          dispatch(
            batchActions([
              loadResFail(),
              hideLoading(),
              snackBarFail('Failed to Load Reports!'),
            ])
          );
        });
    })
    .catch(() => {
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      );
    });
};

export default initialPageLoad;

import axios from 'axios';
import moment from 'moment';
import { batchActions } from 'redux-batched-actions';
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
  updateCheckOut,
} from '../actions/actions';

import { logoutUser } from '../actions/authActions';

import { loadReport, loadHouseKeepingReport } from '../actions/reportActions';

const initialPageLoad = (date) => async (dispatch, getState) => {
  axios.get('/validAccess')
    .catch(() => {
      return dispatch(
        batchActions([
          logoutUser(),
          snackBarSuccess('UnAuthorized Access')
        ])
      );
    });

  const state = getState();
  if (!state.authState.isAuthenticated) {
    return null;
  }

  dispatch(showLoading());
  const reservationRequest = axios.get('/api/reservation/CurrReservation');
  const reportRequest = axios.get(`/api/dailyreport?date=${date}`);

  return axios
    .all([reservationRequest, reportRequest])
    .then(
      axios.spread((...responses) => {
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

        let available = 0;
        let checkOut = 0;

        const currentRes = [];
        const today = moment().format('YYYY-MM-DD');

        for (let i = 0; i < 26; i++) {
          if (current[i] && current[i].RoomID === i + 101) {
            if (moment(today).isSame(current[i].checkOut)) {
              checkOut++;
            }
            currentRes[i] = current[i];
            currentRes[i]._id = undefined;
          } else {
            available++;
            currentRes[i] = {
              RoomID: i + 101,
            };
          }
        }
        available--; // for extra room of 113 which DNE

        // Load Daily Report
        const stays = report.data.Stays;
        const refund = report.data.Refund;
        const reportData = [];
        const houseKeepingData = [];

        Object.entries(stays).forEach(([key, value]) => {
          if (key === '_id') {
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
            payment: value.Room.payment ? value.Room.payment: '',
            initial: value.Room.initial ? value.Room.initial : '',
          });

          // HouseKeeping Report
          houseKeepingData.push({
            RoomID: key,
            status: value.HouseKeeping.status ? value.HouseKeeping.status : 'C',
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
            updateCheckOut(checkOut),
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
};

export default initialPageLoad;

import moment from 'moment';
import { batchActions } from 'redux-batched-actions';

// Config
import config from '../../config';
import axios from './axios';

// Socket Actions
import {
  updateSocketHouseKeepingReport,
  updateSocketReport,
} from '../actions/socket/report';

import {
  updateSocketStayOvers,
  updateSocketAvailable,
  updateSocketCheckIn,
} from '../actions/socket/event';

import {
  loadSocketCurrResSuccess,
  loadSocketPendResSuccess,
  loadSocketOverResSuccess,
} from '../actions/socket/reservation';

// Normal Actions
import {
  snackBarFail,
  snackBarSuccess,
  showLoading,
  hideLoading,
} from '../actions/actions';

import { loadSearchResultSuccess } from '../actions/searchActions';

import { logoutUser } from '../actions/authActions';

import { loadFormFail } from '../actions/formActions';

const Config = config[process.env.NODE_ENV || 'development'];

export const createNewRes = (resData) => (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;

      const currThreshold = moment(
        moment(moment().add(3, 'days')).format('YYYY-MM-DD')
      );

      const currentTime = moment().format('hhmmssSS');
      const randDig1 = Math.floor(Math.random() * 9) + 1;
      const randDig2 = Math.floor(Math.random() * 9) + 1;
      const monthid = moment().month() + 1;
      const yearid = moment().year();
      // generate BookingID
      const bookingid = `${randDig2}${currentTime}${randDig1}`;

      // generate CustomerID
      let customerid;
      if (resData.lastName.length < 3) {
        let lastNameID;
        for (let i = 0; i < 3 - resData.lastName.length; i++) {
          lastNameID = resData.lastName.concat('x');
        }
        customerid =
          lastNameID + resData.firstName.substring(0, 1) + randDig1 + randDig2;
      } else {
        customerid =
          resData.lastName.substring(0, 3) +
          resData.firstName.substring(0, 1) +
          randDig1 +
          randDig2;
      }

      const insertObj = {
        YearID: yearid,
        MonthID: monthid,
        BookingID: bookingid,
        CustomerID: customerid,
        HotelID,
        ...resData,
      };

      const pending = state.pendRes.reservation;
      const current = state.currRes.reservation;
      const dailyReport = state.reportState.report;
      const dailyReportDate = state.reportState.date;
      const { houseKeepingReport } = state.houseKeepingState;
      const housekeepingDate = state.houseKeepingState.date;
      let checkIn = state.info.CheckIn;
      let stayOver = state.info.Stayovers;

      return new Promise((resolve, reject) => {
        // Check to see if reservation room is occupied
        if (
          resData.Checked === 1 &&
          current[insertObj.RoomID - 101].BookingID
        ) {
          throw new Error('Cannot Create into Occupied Room');
        }

        if (currThreshold.isAfter(moment(resData.checkIn))) {
          // add new reservation to current reservation
          return axios
            .post(
              `${Config.apiHost}/api/reservation/CurrReservation?HotelID=${HotelID}`,
              insertObj
            )
            .then((result) => {
              if (result.data.Checked === 2) {
                pending.push(insertObj);

                checkIn++;
                return dispatch(
                  batchActions([
                    updateSocketCheckIn(HotelID, checkIn),
                    loadSocketPendResSuccess(HotelID, pending),
                    hideLoading(),
                    loadFormFail(),
                    snackBarSuccess('Created Successfully!'),
                  ])
                );
              }

              // Make Appropriate changes to the state
              stayOver++;
              current[insertObj.RoomID - 101] = insertObj;
              const today = moment().format('YYYY-MM-DD');

              if (
                moment(dailyReportDate).isSame(today, 'day') &&
                moment(housekeepingDate).isSame(today, 'day')
              ) {
                // DailyReport and Housekeeping State is current day so make need to change both
                dailyReport[insertObj.RoomID - 101] = {
                  ...result.data.Stays[insertObj.RoomID].Room,
                  RoomID: insertObj.RoomID,
                };
                houseKeepingReport[insertObj.RoomID - 101] = {
                  ...result.data.Stays[insertObj.RoomID].HouseKeeping,
                  RoomID: insertObj.RoomID,
                };
                // For a single render
                return dispatch(
                  batchActions([
                    updateSocketReport(HotelID, dailyReport),
                    updateSocketHouseKeepingReport(HotelID, houseKeepingReport),
                    updateSocketStayOvers(HotelID, stayOver),
                    updateSocketAvailable(HotelID, 25 - stayOver),
                    loadSocketCurrResSuccess(HotelID, current),
                    hideLoading(),
                    loadFormFail(),
                    snackBarSuccess('Created Successfully!'),
                  ])
                );
              }

              if (moment(housekeepingDate).isSame(today, 'day')) {
                // Only Housekeeping State is current day so just change housekeeping
                houseKeepingReport[insertObj.RoomID - 101] = {
                  ...result.data.Stays[insertObj.RoomID].HouseKeeping,
                  RoomID: insertObj.RoomID,
                };
                return dispatch(
                  batchActions([
                    updateSocketHouseKeepingReport(HotelID, houseKeepingReport),
                    updateSocketStayOvers(HotelID, stayOver),
                    updateSocketAvailable(HotelID, 25 - stayOver),
                    loadSocketCurrResSuccess(HotelID, current),
                    hideLoading(),
                    loadFormFail(),
                    snackBarSuccess('Created Successfully!'),
                  ])
                );
              }

              if (moment(dailyReportDate).isSame(today, 'day')) {
                // Only DailyReport is current day so just change housekeeping
                dailyReport[insertObj.RoomID - 101] = {
                  ...result.data.Stays[insertObj.RoomID].Room,
                  RoomID: insertObj.RoomID,
                };
                return dispatch(
                  batchActions([
                    updateSocketReport(HotelID, dailyReport),
                    updateSocketStayOvers(HotelID, stayOver),
                    updateSocketAvailable(HotelID, 25 - stayOver),
                    loadSocketCurrResSuccess(HotelID, current),
                    hideLoading(),
                    loadFormFail(),
                    snackBarSuccess('Created Successfully!'),
                  ])
                );
              }

              // Both Housekeeping and DailyReport state is not current day so
              // don't change either
              return dispatch(
                batchActions([
                  updateSocketStayOvers(HotelID, stayOver),
                  updateSocketAvailable(HotelID, 25 - stayOver),
                  loadSocketCurrResSuccess(HotelID, current),
                  hideLoading(),
                  loadFormFail(),
                  snackBarSuccess('Created Successfully!'),
                ])
              );
            })
            .catch((err) => reject(err));
        }
        // add new reservation to pending reservation
        return axios
          .post(
            `${Config.apiHost}/api/reservation/PendingReservation?HotelID=${HotelID}`,
            insertObj
          )
          .then(() =>
            dispatch(
              batchActions([
                hideLoading(),
                loadFormFail(),
                snackBarSuccess('Created Successfully!'),
              ])
            )
          )
          .catch(() => {
            reject(new Error('Failed to Create Reservation'));
          });
      }).catch((err) => {
        // Server error vs client error
        const message = err.message
          ? err.message
          : 'Failed to Create Reservation!';
        return dispatch(batchActions([hideLoading(), snackBarFail(message)]));
      });
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};

// update reservations in Current Collection
export const updateCurrRes = (updatedRes, prevRoom = 0) => async (
  dispatch,
  getState
) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;

      const currRes = state.currRes.reservation;
      const pendRes = state.pendRes.reservation;
      const overRes = state.overRes.reservation;

      let checkIn = state.info.CheckIn;
      const dailyReport = state.reportState.report;
      const dailyReportDate = state.reportState.date;
      const { houseKeepingReport } = state.houseKeepingState;
      const housekeepingDate = state.houseKeepingState.date;

      const pendingThreshold = moment().add(2, 'days');

      return new Promise((resolve, reject) => {
        if (
          updatedRes.Checked === 1 &&
          currRes[updatedRes.RoomID - 101].BookingID &&
          currRes[updatedRes.RoomID - 101].BookingID !== updatedRes.BookingID
        ) {
          return reject(new Error('Cannot Update Into Occupied Room'));
        }
        if (
          updatedRes.Checked !== 1 &&
          moment(updatedRes.checkIn).isAfter(pendingThreshold)
        ) {
          // Move reservation in Current to Pending Collection as checkIn date is beyond threshold
          // UNLESS reservation is already checked in
          return axios
            .put(
              `${Config.apiHost}/api/reservation/CurrReservation?HotelID=${HotelID}&dateChange=true`,
              updatedRes
            )
            .then(() => {
              if (updatedRes.Checked === 2) {
                const newPendRes = pendRes.filter(
                  (res) => res.BookingID !== updatedRes.BookingID
                );

                checkIn--;
                dispatch(
                  batchActions([
                    updateSocketCheckIn(HotelID, checkIn),
                    loadSocketPendResSuccess(HotelID, newPendRes),
                  ])
                );
              } else if (updatedRes.Checked === 1) {
                const newOverRes = overRes.filter(
                  (res) => res.BookingID !== updatedRes.BookingID
                );
                dispatch(loadSocketOverResSuccess(HotelID, newOverRes));
              }
              return dispatch(
                batchActions([
                  loadFormFail(),
                  hideLoading(),
                  snackBarSuccess('Updated Successfully!'),
                ])
              );
            })
            .catch((err) => reject(err));
        }
        // Keep reservation in Current Collection as checkIn date is soon
        return axios
          .put(
            `${Config.apiHost}/api/reservation/CurrReservation?HotelID=${HotelID}&dateChange=false`,
            updatedRes
          )
          .then((result) => {
            // Update in Overdue
            if (updatedRes.Checked === 2) {
              // Update in Arrivals
              for (let i = 0; i < pendRes.length; i++) {
                if (pendRes[i].BookingID === updatedRes.BookingID) {
                  pendRes[i] = result.data;
                  break;
                }
              }
              return dispatch(
                batchActions([
                  loadSocketPendResSuccess(HotelID, pendRes),
                  loadFormFail(),
                  hideLoading(),
                  snackBarSuccess('Updated Successfully!'),
                ])
              );
            }

            // Update in Pending
            if (updatedRes.Checked === 0) {
              // Update in Overdue
              for (let i = 0; i < overRes.length; i++) {
                if (overRes[i].BookingID === updatedRes.BookingID) {
                  overRes[i] = result.data;
                  break;
                }
              }
              return dispatch(
                batchActions([
                  loadSocketOverResSuccess(HotelID, overRes),
                  loadFormFail(),
                  hideLoading(),
                  snackBarSuccess('Updated Successfully!'),
                ])
              );
            }

            // Update in Current
            /**
             * @NOTE Redux seems to change the state if currRes, etc are reinitilized even though
             * there wasn't any dispatch.
             *
             * Therefore the reinitialization of states for if rooms are changed are controlled by
             * each condition for a single render.
             */
            currRes[updatedRes.RoomID - 101] = result.data.UpdatedRes;

            const today = moment().format('YYYY-MM-DD');
            if (
              moment(dailyReportDate).isSame(today, 'day') &&
              moment(housekeepingDate).isSame(today, 'day')
            ) {
              // DailyReport and Housekeeping state are the current day so need to change both

              // Room Has Been updated (moved)
              if (prevRoom !== updatedRes.RoomID) {
                currRes[prevRoom - 101] = {
                  RoomID: prevRoom,
                };
                dailyReport[prevRoom - 101] = {
                  RoomID: prevRoom,
                };
                houseKeepingReport[prevRoom - 101] = {
                  ...result.data.UpdatedReport.Stays[`${prevRoom}`]
                    .HouseKeeping,
                  RoomID: prevRoom,
                };
              }

              dailyReport[updatedRes.RoomID - 101] = {
                ...result.data.UpdatedReport.Stays[`${updatedRes.RoomID}`].Room,
                RoomID: updatedRes.RoomID,
              };
              houseKeepingReport[updatedRes.RoomID - 101] = {
                ...result.data.UpdatedReport.Stays[`${updatedRes.RoomID}`]
                  .HouseKeeping,
                RoomID: updatedRes.RoomID,
              };
              return dispatch(
                batchActions([
                  updateSocketReport(HotelID, dailyReport),
                  updateSocketHouseKeepingReport(HotelID, houseKeepingReport),
                  loadSocketCurrResSuccess(HotelID, currRes),
                  loadFormFail(),
                  hideLoading(),
                  snackBarSuccess('Updated Successfully!'),
                ])
              );
            }

            if (moment(dailyReportDate).isSame(today, 'day')) {
              // Only DailyReport state is current day so just change this

              // Room Has Been updated (moved)
              if (prevRoom !== updatedRes.RoomID) {
                currRes[prevRoom - 101] = {
                  RoomID: prevRoom,
                };
                dailyReport[prevRoom - 101] = {
                  RoomID: prevRoom,
                };
              }
              dailyReport[updatedRes.RoomID - 101] = {
                ...result.data.UpdatedReport.Stays[`${updatedRes.RoomID}`].Room,
                RoomID: updatedRes.RoomID,
              };
              return dispatch(
                batchActions([
                  updateSocketReport(HotelID, dailyReport),
                  loadSocketCurrResSuccess(HotelID, currRes),
                  loadFormFail(),
                  hideLoading(),
                  snackBarSuccess('Updated Successfully!'),
                ])
              );
            }

            if (moment(housekeepingDate).isSame(today, 'day')) {
              // Room Has Been updated (moved)
              if (prevRoom !== updatedRes.RoomID) {
                currRes[prevRoom - 101] = {
                  RoomID: prevRoom,
                };
                houseKeepingReport[prevRoom - 101] = {
                  ...result.data.UpdatedReport.Stays[`${prevRoom}`]
                    .HouseKeeping,
                  RoomID: prevRoom,
                };
              }
              // Only Housekeeping state is current day so just change this
              houseKeepingReport[updatedRes.RoomID - 101] = {
                ...result.data.UpdatedReport.Stays[`${updatedRes.RoomID}`]
                  .HouseKeeping,
                RoomID: updatedRes.RoomID,
              };
              return dispatch(
                batchActions([
                  updateSocketHouseKeepingReport(HotelID, houseKeepingReport),
                  loadSocketCurrResSuccess(HotelID, currRes),
                  loadFormFail(),
                  hideLoading(),
                  snackBarSuccess('Updated Successfully!'),
                ])
              );
            }

            // Housekeeping and DailyReport state are not current day so change neither
            // Room Has Been updated (moved)
            if (prevRoom !== updatedRes.RoomID) {
              currRes[prevRoom - 101] = {
                RoomID: prevRoom,
              };
            }
            return dispatch(
              batchActions([
                // loadSocketCurrResSuccess(HotelID, currRes),
                loadFormFail(),
                hideLoading(),
                snackBarSuccess('Updated Successfully!'),
              ])
            );
          })
          .catch((err) => {
            reject(err);
          });
      }).catch((err) => {
        const message = err.message ? err.message : 'Failed to Update!';
        return dispatch(
          batchActions([loadFormFail(), hideLoading(), snackBarFail(message)])
        );
      });
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};

// move reservations in current collection between different fields of Checked
export const moveCurrRes = (
  updatedRes,
  prevRoom,
  origin,
  destination
) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      const currRes = state.currRes.reservation;
      const pendRes = state.pendRes.reservation;
      const overRes = state.overRes.reservation;

      let checkIn = state.info.CheckIn;
      let available = state.info.Available;
      let stayOvers = state.info.Stayovers;
      const dailyReport = state.reportState.report;
      const dailyReportDate = state.reportState.date;
      const { houseKeepingReport } = state.houseKeepingState;
      const housekeepingDate = state.houseKeepingState.date;

      // Generate Proper CheckIn and CheckOut Dates
      // eslint-disable-next-line no-param-reassign
      updatedRes.checkIn = moment(updatedRes.checkIn).format(
        'YYYY-MM-DDT12:00:00[Z]'
      );
      // eslint-disable-next-line no-param-reassign
      updatedRes.checkOut = moment(updatedRes.checkOut).format(
        'YYYY-MM-DDT12:00:00[Z]'
      );

      return new Promise((resolve, reject) => {
        if (destination === 'arrival' && origin === 'current') {
          return axios
            .put(
              `${Config.apiHost}/api/reservation/CurrReservation?HotelID=${HotelID}&moveToArr=true`,
              updatedRes
            )
            .then((result) => {
              currRes[prevRoom - 101] = {
                RoomID: prevRoom,
              };

              pendRes.push(updatedRes);
              // Update info
              checkIn++;
              stayOvers--;
              available++;

              const today = moment().format('YYYY-MM-DD');
              if (
                moment(dailyReportDate).isSame(today, 'day') &&
                moment(housekeepingDate).isSame(today, 'day')
              ) {
                // DailyReport and Housekeeping state are current day so change both
                dailyReport[prevRoom - 101] = {
                  RoomID: prevRoom,
                };
                houseKeepingReport[prevRoom - 101] = {
                  ...result.data.Stays[`${prevRoom}`].HouseKeeping,
                  RoomID: prevRoom,
                };
                return dispatch(
                  batchActions([
                    loadSocketCurrResSuccess(HotelID, currRes),
                    loadSocketPendResSuccess(HotelID, pendRes),
                    updateSocketReport(HotelID, dailyReport),
                    updateSocketHouseKeepingReport(HotelID, houseKeepingReport),
                    updateSocketCheckIn(HotelID, checkIn),
                    updateSocketStayOvers(HotelID, stayOvers),
                    updateSocketAvailable(HotelID, available),
                    loadFormFail(),
                    hideLoading(),
                    snackBarSuccess('Moved Successfully!'),
                  ])
                );
              }

              if (moment(housekeepingDate).isSame(today, 'day')) {
                houseKeepingReport[prevRoom - 101] = {
                  ...result.data.Stays[`${prevRoom}`].HouseKeeping,
                  RoomID: prevRoom,
                };
                // Only Housekeeping is current day so just change this
                return dispatch(
                  batchActions([
                    loadSocketCurrResSuccess(HotelID, currRes),
                    loadSocketPendResSuccess(HotelID, pendRes),
                    updateSocketHouseKeepingReport(HotelID, houseKeepingReport),
                    updateSocketCheckIn(HotelID, checkIn),
                    updateSocketStayOvers(HotelID, stayOvers),
                    updateSocketAvailable(HotelID, available),
                    loadFormFail(),
                    hideLoading(),
                    snackBarSuccess('Moved Successfully!'),
                  ])
                );
              }

              if (moment(dailyReportDate).isSame(today, 'day')) {
                // Only DailyReport is current day so just change this
                dailyReport[prevRoom - 101] = {
                  RoomID: prevRoom,
                };
                return dispatch(
                  batchActions([
                    loadSocketCurrResSuccess(HotelID, currRes),
                    loadSocketPendResSuccess(HotelID, pendRes),
                    updateSocketReport(HotelID, dailyReport),
                    updateSocketCheckIn(HotelID, checkIn),
                    updateSocketStayOvers(HotelID, stayOvers),
                    updateSocketAvailable(HotelID, available),
                    loadFormFail(),
                    hideLoading(),
                    snackBarSuccess('Moved Successfully!'),
                  ])
                );
              }

              // DailyReport and Houekeeping are not current day so change neither
              // will only result in one render
              return dispatch(
                batchActions([
                  loadSocketCurrResSuccess(HotelID, currRes),
                  loadSocketPendResSuccess(HotelID, pendRes),
                  updateSocketCheckIn(HotelID, checkIn),
                  updateSocketStayOvers(HotelID, stayOvers),
                  updateSocketAvailable(HotelID, available),
                  loadFormFail(),
                  hideLoading(),
                  snackBarSuccess('Moved Successfully!'),
                ])
              );
            })
            .catch((err) => reject(err));
        }
        // No require changes in Report so just update the reservation and dispatch the changes to the state
        return axios
          .put(
            `${Config.apiHost}/api/reservation/CurrReservation?HotelID=${HotelID}&BookingID=${updatedRes.BookingID}&dateChange=false`,
            updatedRes
          )
          .then(() => {
            if (destination === 'arrival' && origin === 'over') {
              for (let i = 0; i < overRes.length; i++) {
                if (overRes[i].BookingID === updatedRes.BookingID) {
                  overRes.splice(i, 1);
                }
              }

              checkIn++;
              pendRes.push(updatedRes);

              dispatch(
                batchActions([
                  updateSocketCheckIn(HotelID, checkIn),
                  loadSocketOverResSuccess(HotelID, overRes),
                  loadSocketPendResSuccess(HotelID, pendRes),
                ])
              );
            } else if (destination === 'over' && origin === 'arrival') {
              for (let i = 0; i < pendRes.length; i++) {
                if (pendRes[i].BookingID === updatedRes.BookingID) {
                  pendRes.splice(i, 1);
                }
              }
              checkIn--;
              overRes.push(updatedRes);

              dispatch(
                batchActions([
                  updateSocketCheckIn(HotelID, checkIn),
                  loadSocketOverResSuccess(HotelID, overRes),
                  loadSocketPendResSuccess(HotelID, pendRes),
                ])
              );
            }
            return dispatch(
              batchActions([
                loadFormFail(),
                hideLoading(),
                snackBarSuccess('Moved Successfully!'),
              ])
            );
          })
          .catch((err) => reject(err));
      }).catch((err) => {
        const message = err.message
          ? err.message
          : 'Failed to Move Reservation!';
        return dispatch(
          batchActions([loadFormFail(), hideLoading(), snackBarFail(message)])
        );
      });
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};

// Move reservations from Current Collection to Delete Collection
export const deleteCurrRes = (BookingID) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;

      const overRes = state.overRes.reservation;

      return new Promise((resolve, reject) =>
        axios
          .delete(
            `${Config.apiHost}/api/reservation/CurrReservation?HotelID=${HotelID}&BookingID=${BookingID}`
          )
          .then(() => {
            for (let i = 0; i < overRes.length; i++) {
              if (overRes[i].BookingID === BookingID) {
                overRes.splice(i, 1);
              }
            }

            return dispatch(
              batchActions([
                loadSocketOverResSuccess(HotelID, overRes),
                loadFormFail(),
                hideLoading(),
                snackBarSuccess('Moved Successfully!'),
              ])
            );
          })
          .catch((err) => reject(err))
      ).catch((err) => {
        const message = err.message
          ? err.message
          : 'Failed to Delete Reservation!';
        return dispatch(
          batchActions([loadFormFail(), hideLoading(), snackBarFail(message)])
        );
      });
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};

export const checkInRes = (resObj) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      let pending = state.pendRes.reservation;
      const current = state.currRes.reservation;

      let checkIn = state.info.CheckIn;
      let available = state.info.Available;
      let stayOvers = state.info.Stayovers;
      const dailyReport = state.reportState.report;
      const dailyReportDate = state.reportState.date;
      const { houseKeepingReport } = state.houseKeepingState;
      const housekeepingDate = state.houseKeepingState.date;

      return new Promise((resolve, reject) => {
        if (current[resObj.RoomID - 101].BookingID) {
          reject(new Error('Cannot Check In Guest into Occupied Room'));
        } else {
          axios
            .put(
              `${Config.apiHost}/api/reservation/CurrReservation?HotelID=${HotelID}&checkIn=true`,
              {
                ...resObj,
                Checked: 1,
              }
            )
            .then((result) => {
              // update pending and current reservation state
              pending = pending.filter(
                (res) => res.BookingID !== resObj.BookingID
              );
              current[resObj.RoomID - 101] = result.data.UpdatedRes;
              // Update Info
              checkIn--;
              available--;
              stayOvers++;

              const today = moment().format('YYYY-MM-DD');
              if (
                moment(dailyReportDate).isSame(today, 'day') &&
                moment(housekeepingDate).isSame(today, 'day')
              ) {
                // Update DailyReport and HouseKeeping State as DailyReport and Housekeeping state
                // is set to current day
                dailyReport[resObj.RoomID - 101] = {
                  ...result.data.UpdatedReport.Stays[`${resObj.RoomID}`].Room,
                  RoomID: resObj.RoomID,
                };
                houseKeepingReport[resObj.RoomID - 101] = {
                  ...result.data.UpdatedReport.Stays[`${resObj.RoomID}`]
                    .HouseKeeping,
                  RoomID: resObj.RoomID,
                };
                return dispatch(
                  batchActions([
                    updateSocketCheckIn(HotelID, checkIn),
                    updateSocketAvailable(HotelID, available),
                    updateSocketStayOvers(HotelID, stayOvers),
                    loadSocketPendResSuccess(HotelID, pending),
                    loadSocketCurrResSuccess(HotelID, current),
                    updateSocketReport(HotelID, dailyReport),
                    updateSocketHouseKeepingReport(HotelID, houseKeepingReport),
                  ])
                );
              }

              if (moment(housekeepingDate).isSame(today, 'day')) {
                // Update only Housekeeping as only housekeeping state is set to current day
                houseKeepingReport[resObj.RoomID - 101] = {
                  ...result.data.UpdatedReport.Stays[`${resObj.RoomID}`]
                    .HouseKeeping,
                  RoomID: resObj.RoomID,
                };
                return dispatch(
                  batchActions([
                    updateSocketCheckIn(HotelID, checkIn),
                    updateSocketAvailable(HotelID, available),
                    updateSocketStayOvers(HotelID, stayOvers),
                    loadSocketPendResSuccess(HotelID, pending),
                    loadSocketCurrResSuccess(HotelID, current),
                    updateSocketHouseKeepingReport(HotelID, houseKeepingReport),
                  ])
                );
              }

              if (moment(dailyReportDate).isSame(today, 'day')) {
                // Update only DailyReport as only housekeeping state is set to current day
                dailyReport[resObj.RoomID - 101] = {
                  ...result.data.UpdatedReport.Stays[`${resObj.RoomID}`].Room,
                  RoomID: resObj.RoomID,
                };
                return dispatch(
                  batchActions([
                    updateSocketCheckIn(HotelID, checkIn),
                    updateSocketAvailable(HotelID, available),
                    updateSocketStayOvers(HotelID, stayOvers),
                    loadSocketPendResSuccess(HotelID, pending),
                    loadSocketCurrResSuccess(HotelID, current),
                    updateSocketReport(HotelID, dailyReport),
                  ])
                );
              }

              // DailyReport and Housekeeping are not current day so change neither
              return dispatch(
                batchActions([
                  updateSocketCheckIn(HotelID, checkIn),
                  updateSocketAvailable(HotelID, available),
                  updateSocketStayOvers(HotelID, stayOvers),
                  loadSocketPendResSuccess(HotelID, pending),
                  loadSocketCurrResSuccess(HotelID, current),
                ])
              );
            })
            .then(() => {
              dispatch(
                batchActions([
                  loadFormFail(),
                  hideLoading(),
                  snackBarSuccess('Checked In Successfully!'),
                ])
              );
            })
            .catch(() => {
              reject(new Error('Failed to Load'));
            });
        }
      }).catch((err) => {
        const message = err.message ? err.message : 'Failed to Check-In Guest!';
        dispatch(
          batchActions([loadFormFail(), hideLoading(), snackBarFail(message)])
        );
      });
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};

export const checkOutRes = (resObj) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      const current = state.currRes.reservation;

      let available = state.info.Available;
      let stayOvers = state.info.Stayovers;
      const dailyReport = state.reportState.report;
      const dailyReportDate = state.reportState.date;

      const { houseKeepingReport } = state.houseKeepingState;
      const housekeepingDate = state.houseKeepingState.date;

      return new Promise((resolve, reject) =>
        axios
          .post(`${Config.apiHost}/api/customer?HotelID=${HotelID}`, resObj)
          .then((response) => {
            const prevRoom = response.data.PrevResObj.RoomID;
            current[prevRoom - 101] = {
              RoomID: prevRoom,
            };

            // Update Info
            available++;
            stayOvers--;

            const today = moment().format('YYYY-MM-DD');
            if (
              moment(dailyReportDate).isSame(today, 'day') &&
              moment(housekeepingDate).isSame(today, 'day')
            ) {
              // DailyReport and Housekeeping are current day so change both
              dailyReport[prevRoom - 101] = {
                ...response.data.UpdatedReport.Stays[`${prevRoom}`].Room,
                RoomID: prevRoom,
              };
              houseKeepingReport[prevRoom - 101] = {
                ...response.data.UpdatedReport.Stays[`${prevRoom}`]
                  .HouseKeeping,
                RoomID: prevRoom,
              };
              return dispatch(
                batchActions([
                  updateSocketAvailable(HotelID, available),
                  updateSocketStayOvers(HotelID, stayOvers),
                  loadSocketCurrResSuccess(HotelID, current),
                  updateSocketReport(HotelID, dailyReport),
                  updateSocketHouseKeepingReport(HotelID, houseKeepingReport),
                  loadFormFail(),
                  hideLoading(),
                  snackBarSuccess('Checked Out Guest'),
                ])
              );
            }

            if (moment(dailyReportDate).isSame(today, 'day')) {
              // Only DailyReport is current day so just change this
              dailyReport[prevRoom - 101] = {
                ...response.data.UpdatedReport.Stays[`${prevRoom}`].Room,
                RoomID: prevRoom,
              };
              return dispatch(
                batchActions([
                  updateSocketAvailable(HotelID, available),
                  updateSocketStayOvers(HotelID, stayOvers),
                  loadSocketCurrResSuccess(HotelID, current),
                  updateSocketReport(HotelID, dailyReport),
                  loadFormFail(),
                  hideLoading(),
                  snackBarSuccess('Checked Out Guest'),
                ])
              );
            }

            if (moment(housekeepingDate).isSame(today, 'day')) {
              // Only Housekeeping is current day so just change this
              houseKeepingReport[prevRoom - 101] = {
                ...response.data.UpdatedReport.Stays[`${prevRoom}`]
                  .HouseKeeping,
                RoomID: prevRoom,
              };
              return dispatch(
                batchActions([
                  updateSocketAvailable(HotelID, available),
                  updateSocketStayOvers(HotelID, stayOvers),
                  loadSocketCurrResSuccess(HotelID, current),
                  updateSocketHouseKeepingReport(HotelID, houseKeepingReport),
                  loadFormFail(),
                  hideLoading(),
                  snackBarSuccess('Checked Out Guest'),
                ])
              );
            }

            // DailyReport and Housekeeping are not current day so change neither
            return dispatch(
              batchActions([
                updateSocketAvailable(HotelID, available),
                updateSocketStayOvers(HotelID, stayOvers),
                loadSocketCurrResSuccess(HotelID, current),
                loadFormFail(),
                hideLoading(),
                snackBarSuccess('Checked Out Guest'),
              ])
            );
          })
          .catch(() => {
            reject(new Error('Failed to CheckOut Guest'));
          })
      ).catch((err) => {
        const message = err.message ? err.message : 'Failed to Check-In Guest!';
        dispatch(
          batchActions([loadFormFail(), hideLoading(), snackBarFail(message)])
        );
      });
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};

// update Reservations in Pending Collection
export const updateReservation = (updatedRes) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;

      // to check if updated date is past threshold
      const threshold = moment().add(2, 'days');

      const pendRes = state.pendRes.reservation;
      const searchResult = state.searchResultState.results;
      let checkIn = state.info.CheckIn;

      if (threshold.isSameOrAfter(moment(updatedRes.checkIn))) {
        // check-in date is within threshold so update into Current
        return axios
          .put(
            `${Config.apiHost}/api/reservation/PendingReservation?HotelID=${HotelID}&dateChange=true`,
            updatedRes
          )
          .then(() => {
            pendRes.push(updatedRes);
            checkIn++;

            for (let i = 0; i < searchResult.length; i++) {
              if (searchResult[i].BookingID === updatedRes.BookingID) {
                searchResult.splice(i, 1);
                break;
              }
            }

            dispatch(
              batchActions([
                updateSocketCheckIn(HotelID, checkIn),
                loadSearchResultSuccess(searchResult),
                loadSocketPendResSuccess(HotelID, pendRes),
                loadFormFail(),
                hideLoading(),
                snackBarSuccess('Updated Successfully'),
              ])
            );
          })
          .catch(() => {
            dispatch(
              batchActions([
                loadFormFail(),
                hideLoading(),
                snackBarFail('Failed to Update'),
              ])
            );
          });
      }
      // check-in date is beyond threshold so keep in Pending
      return axios
        .put(
          `${Config.apiHost}/api/reservation/PendingReservation?HotelID=${HotelID}&dateChange=false`,
          updatedRes
        )
        .then(() => {
          for (let i = 0; i < searchResult.length; i++) {
            if (searchResult[i].BookingID === updatedRes.BookingID) {
              searchResult[i] = updatedRes;
              break;
            }
          }
          dispatch(
            batchActions([
              loadSearchResultSuccess(searchResult),
              loadFormFail(),
              hideLoading(),
              snackBarSuccess('Updated Successfully'),
            ])
          );
        })
        .catch(() => {
          dispatch(
            batchActions([
              loadFormFail(),
              hideLoading(),
              snackBarFail('Failed to Update'),
            ])
          );
        });
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};

export const updateDelReservation = (updatedRes) => async (
  dispatch,
  getState
) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;

      return axios
        .put(
          `${Config.apiHost}/api/reservation/delreservations?HotelID=${HotelID}`,
          updatedRes
        )
        .then(() => {
          const searchResult = state.searchResultState.results;

          for (let i = 0; i < searchResult.length; i++) {
            if (searchResult[i].BookingID === updatedRes.BookingID) {
              searchResult[i] = updatedRes;
              break;
            }
          }
          dispatch(
            batchActions([
              loadSearchResultSuccess(searchResult),
              loadFormFail(),
              hideLoading(),
              snackBarSuccess('Updated Successfully'),
            ])
          );
        })
        .catch(() => {
          dispatch(
            batchActions([
              loadFormFail(),
              hideLoading(),
              snackBarFail('Failed to Update'),
            ])
          );
        });
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};

// Move reservation from Pending into Delete Collection
export const cancelReservation = (BookingID) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;
      return axios
        .delete(
          `${Config.apiHost}/api/reservation/PendingReservation?HotelID=${HotelID}&BookingID=${BookingID}`
        )
        .then(() => {
          const searchResult = state.searchResultState.results;
          for (let i = 0; i < searchResult.length; i++) {
            if (searchResult[i].BookingID === BookingID) {
              searchResult.splice(i, 1);
              break;
            }
          }
          dispatch(
            batchActions([
              loadSearchResultSuccess(searchResult),
              loadFormFail(),
              hideLoading(),
              snackBarSuccess('Deleted Successfully'),
            ])
          );
        })
        .catch(() => {
          dispatch(
            batchActions([
              loadFormFail(),
              hideLoading(),
              snackBarFail('Failed to Delete'),
            ])
          );
        });
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};

export const permDelReservation = (BookingID) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get(`${Config.apiHost}/validAccess`)
    .then(() => {
      const state = getState();
      if (!state.authState.isAuthenticated) {
        return null;
      }

      const { HotelID } = state.authState.user;

      return axios
        .delete(
          `${Config.apiHost}/api/reservation/delreservations?HotelID=${HotelID}&BookingID=${BookingID}`
        )
        .then(() => {
          const searchResult = state.searchResultState.results;
          for (let i = 0; i < searchResult.length; i++) {
            if (searchResult[i].BookingID === BookingID) {
              searchResult.splice(i, 1);
              break;
            }
          }
          dispatch(
            batchActions([
              loadSearchResultSuccess(searchResult),
              loadFormFail(),
              hideLoading(),
              snackBarSuccess('Deleted Successfully'),
            ])
          );
        })
        .catch(() => {
          dispatch(
            batchActions([
              loadFormFail(),
              hideLoading(),
              snackBarFail('Failed to Delete'),
            ])
          );
        });
    })
    .catch(() =>
      dispatch(
        batchActions([
          logoutUser(),
          hideLoading(),
          snackBarSuccess('UnAuthorized Access'),
        ])
      )
    );
};

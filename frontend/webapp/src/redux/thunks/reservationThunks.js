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
    .get('/validAccess')
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
      const { houseKeepingReport } = state.houseKeepingState;
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
          const roomType = houseKeepingReport[insertObj.RoomID - 101].type;
          return axios
            .post(
              `${Config.apiHost}/api/reservation/CurrReservation?HotelID=${HotelID}&roomType=${roomType}`,
              insertObj
            )
            .then((result) => {
              if (result.data.Checked === 2) {
                pending.push(insertObj);

                checkIn++;
                dispatch(
                  batchActions([
                    updateSocketCheckIn(HotelID, checkIn),
                    loadSocketPendResSuccess(HotelID, pending),
                  ])
                );
              } else {
                // Make Appropriate changes to the state
                current[insertObj.RoomID - 101] = insertObj;
                dailyReport[insertObj.RoomID - 101] = {
                  ...result.data.Stays[insertObj.RoomID].Room,
                  RoomID: insertObj.RoomID,
                };
                houseKeepingReport[insertObj.RoomID - 101] = {
                  ...result.data.Stays[insertObj.RoomID].HouseKeeping,
                  RoomID: insertObj.RoomID,
                };
                stayOver++;

                dispatch(
                  batchActions([
                    updateSocketStayOvers(HotelID, stayOver),
                    updateSocketAvailable(HotelID, 25 - stayOver),
                    loadSocketCurrResSuccess(HotelID, current),
                    updateSocketReport(HotelID, dailyReport),
                    updateSocketHouseKeepingReport(HotelID, houseKeepingReport),
                  ])
                );
              }

              return dispatch(
                batchActions([
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
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
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
    .get('/validAccess')
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
      const { houseKeepingReport } = state.houseKeepingState;

      const pendingThreshold = moment().add(2, 'days');

      return new Promise((resolve, reject) => {
        const roomType = houseKeepingReport[updatedRes.RoomID - 101].type;
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
              `${Config.apiHost}/api/reservation/CurrReservation?HotelID=${HotelID}&dateChange=true&roomType=${roomType}`,
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
            `${Config.apiHost}/api/reservation/CurrReservation?HotelID=${HotelID}&dateChange=false&roomType=${roomType}`,
            updatedRes
          )
          .then((result) => {
            if (updatedRes.Checked === 2) {
              // Update in Arrivals
              for (let i = 0; i < pendRes.length; i++) {
                if (pendRes[i].BookingID === updatedRes.BookingID) {
                  pendRes[i] = result.data;
                  break;
                }
              }
              dispatch(loadSocketPendResSuccess(HotelID, pendRes));
            } else if (updatedRes.Checked === 0) {
              // Update in Overdue
              for (let i = 0; i < overRes.length; i++) {
                if (overRes[i].BookingID === updatedRes.BookingID) {
                  overRes[i] = result.data;
                  break;
                }
              }
              dispatch(loadSocketOverResSuccess(HotelID, overRes));
            } else {
              // Update in current

              // Room Has Been updated
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

              currRes[updatedRes.RoomID - 101] = result.data.UpdatedRes;
              dailyReport[updatedRes.RoomID - 101] = {
                ...result.data.UpdatedReport.Stays[`${updatedRes.RoomID}`].Room,
                RoomID: updatedRes.RoomID,
              };
              houseKeepingReport[updatedRes.RoomID - 101] = {
                ...result.data.UpdatedReport.Stays[`${updatedRes.RoomID}`]
                  .HouseKeeping,
                RoomID: updatedRes.RoomID,
              };

              dispatch(
                batchActions([
                  loadSocketCurrResSuccess(HotelID, currRes),
                  updateSocketReport(HotelID, dailyReport),
                  updateSocketHouseKeepingReport(HotelID, houseKeepingReport),
                ])
              );
            }
            return dispatch(
              batchActions([
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
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
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
    .get('/validAccess')
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
      const { houseKeepingReport } = state.houseKeepingState;

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
        const roomType = houseKeepingReport[prevRoom - 101].type;
        if (destination === 'arrival' && origin === 'current') {
          return axios
            .put(
              `${Config.apiHost}/api/reservation/CurrReservation?HotelID=${HotelID}&moveToArr=true&roomType=${roomType}`,
              updatedRes
            )
            .then((result) => {
              currRes[prevRoom - 101] = {
                RoomID: prevRoom,
              };
              dailyReport[prevRoom - 101] = {
                RoomID: prevRoom,
              };
              houseKeepingReport[prevRoom - 101] = {
                ...result.data.Stays[`${prevRoom}`].HouseKeeping,
                RoomID: prevRoom,
              };
              pendRes.push(updatedRes);
              // Update info
              checkIn++;
              stayOvers--;
              available++;

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
            })
            .catch((err) => reject(err));
        }
        // No require changes in Report so just update the reservation and dispatch the changes to the state
        return axios
          .put(
            `${Config.apiHost}/api/reservation/CurrReservation?HotelID=${HotelID}&BookingID=${updatedRes.BookingID}&dateChange=false&roomType=${roomType}`,
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
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );
};

// Move reservations from Current Collection to Delete Collection
export const deleteCurrRes = (BookingID) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get('/validAccess')
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
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );
};

export const checkInRes = (resObj) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get('/validAccess')
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
      const { houseKeepingReport } = state.houseKeepingState;

      return new Promise((resolve, reject) => {
        const roomType = houseKeepingReport[resObj.RoomID - 101].type;
        if (current[resObj.RoomID - 101].BookingID) {
          reject(new Error('Cannot Check In Guest into Occupied Room'));
        } else {
          axios
            .put(
              `${Config.apiHost}/api/reservation/CurrReservation?HotelID=${HotelID}&checkIn=true&roomType=${roomType}`,
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

              // Update DailyReport and HouseKeeping State
              dailyReport[resObj.RoomID - 101] = {
                ...result.data.UpdatedReport.Stays[`${resObj.RoomID}`].Room,
                RoomID: resObj.RoomID,
              };
              houseKeepingReport[resObj.RoomID - 101] = {
                ...result.data.UpdatedReport.Stays[`${resObj.RoomID}`]
                  .HouseKeeping,
                RoomID: resObj.RoomID,
              };

              // Update Info
              checkIn--;
              available--;
              stayOvers++;
              dispatch(
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
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );
};

export const checkOutRes = (resObj) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get('/validAccess')
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
      const { houseKeepingReport } = state.houseKeepingState;

      return new Promise((resolve, reject) => {
        const roomType = houseKeepingReport[resObj.RoomID - 101].type;

        return axios
          .post(
            `${Config.apiHost}/api/customer?HotelID=${HotelID}&roomType=${roomType}`,
            resObj
          )
          .then((response) => {
            const prevRoom = response.data.PrevResObj.RoomID;
            current[prevRoom - 101] = {
              RoomID: prevRoom,
            };
            dailyReport[prevRoom - 101] = {
              ...response.data.UpdatedReport.Stays[`${prevRoom}`].Room,
              RoomID: prevRoom,
            };
            houseKeepingReport[prevRoom - 101] = {
              ...response.data.UpdatedReport.Stays[`${prevRoom}`].HouseKeeping,
              RoomID: prevRoom,
            };

            available++;
            stayOvers--;

            dispatch(
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
          })
          .catch(() => {
            reject(new Error('Failed to CheckOut Guest'));
          });
      }).catch((err) => {
        const message = err.message ? err.message : 'Failed to Check-In Guest!';
        dispatch(
          batchActions([loadFormFail(), hideLoading(), snackBarFail(message)])
        );
      });
    })
    .catch(() =>
      dispatch(
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );
};

// update Reservations in Pending Collection
export const updateReservation = (updatedRes) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get('/validAccess')
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
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );
};

export const updateDelReservation = (updatedRes) => async (
  dispatch,
  getState
) => {
  dispatch(showLoading());
  return axios
    .get('/validAccess')
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
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );
};

// Move reservation from Pending into Delete Collection
export const cancelReservation = (BookingID) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get('/validAccess')
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
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );
};

export const permDelReservation = (BookingID) => async (dispatch, getState) => {
  dispatch(showLoading());
  return axios
    .get('/validAccess')
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
        batchActions([logoutUser(), snackBarSuccess('UnAuthorized Access')])
      )
    );
};

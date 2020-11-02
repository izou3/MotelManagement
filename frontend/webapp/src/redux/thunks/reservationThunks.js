import axios from 'axios';
import moment from 'moment';
import { batchActions } from 'redux-batched-actions';

import {
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

import { loadSearchResultSuccess } from '../actions/searchActions';

import {
  updateReport,
  updateHouseKeepingReport,
} from '../actions/reportActions';

import { loadFormFail } from '../actions/formActions';

export const createNewRes = (resData) => (dispatch, getState) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;
  dispatch(showLoading());

  const currThreshold = moment().add(2, 'days');

  const currentTime = moment().format('hhmmssSS');
  const randDig1 = Math.floor(Math.random() * 9);
  const randDig2 = Math.floor(Math.random() * 9);
  const yearid = moment().month() + 1;
  const monthid = moment().year();
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

  // Format Check-In and Check-Out Properly
  resData.checkIn = moment(resData.checkIn).format('YYYY-MM-DDT12:00:00[Z]');
  resData.checkOut = moment(resData.checkOut).format(
    'YYYY-MM-DDT12:00:00[Z]'
  );

  const insertObj = {
    YearID: yearid,
    MonthID: monthid,
    BookingID: bookingid,
    CustomerID: customerid,
    ...resData,
  };

  const pending = state.pendRes.reservation;
  const current = state.currRes.reservation;
  const dailyReport = state.reportState.report;
  const { houseKeepingReport } = state.houseKeepingState;
  let checkIn = state.info.CheckIn;
  let stayOver = state.info.Stayovers;
  const roomType = houseKeepingReport[insertObj.RoomID - 101].type;

  return new Promise((resolve, reject) => {
    // Check to see if reservation room is occupied
    if (resData.Checked === 1 && current[insertObj.RoomID - 101].BookingID) {
      throw new Error('Cannot Create into Occupied Room');
    }

    if (currThreshold.isAfter(moment(resData.checkIn))) {
      // add new reservation to current reservation
      axios
        .post(
          `/api/reservation/CurrReservation?roomType=${roomType}`,
          insertObj
        )
        .then((result) => {
          if (result.data.Checked === 2) {
            pending.push(insertObj);

            checkIn++;
            dispatch(updateCheckIn(checkIn));
            dispatch(loadPendResSuccess(pending));
          } else {
            console.log(result.data);
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
                updateStayOvers(stayOver),
                updateAvailable(25 - stayOver),
                loadCurrResSuccess(current),
                updateReport(dailyReport),
                updateHouseKeepingReport(houseKeepingReport),
              ])
            );
          }
          dispatch(
            batchActions([
              hideLoading(),
              loadFormFail(),
              snackBarSuccess('Created Successfully!'),
            ])
          );
        })
        .catch((err) => {
          reject(err);
        });
    } else {
      // add new reservation to pending reservation
      dispatch(showLoading());
      axios
        .post('/api/reservation/PendingReservation', insertObj)
        .then(() => {
          dispatch(
            batchActions([
              hideLoading(),
              loadFormFail(),
              snackBarSuccess('Created Successfully!'),
            ])
          );
        })
        .catch(() => {
          reject(new Error('Failed to Create Reservation'));
        });
    }
  }).catch((err) => {
    const message = err.message ? err.message : err;
    dispatch(batchActions([hideLoading(), snackBarFail(message)]));
  });
};

// update reservations in Current Collection
export const updateCurrRes = (updatedRes, prevRoom = 0) => async (
  dispatch,
  getState
) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null; // Case if Token has Expired

  dispatch(showLoading());
  const currRes = state.currRes.reservation;
  const pendRes = state.pendRes.reservation;
  const overRes = state.overRes.reservation;

  let checkIn = state.info.CheckIn;
  const dailyReport = state.reportState.report;
  const { houseKeepingReport } = state.houseKeepingState;
  const roomType = houseKeepingReport[updatedRes.RoomID - 101].type;

  const pendingThreshold = moment().add(2, 'days');

  // Generate Proper CheckIn and CheckOut Dates
  updatedRes.checkIn = moment(updatedRes.checkIn).format('YYYY-MM-DDT12:00:00[Z]');
  updatedRes.checkOut = moment(updatedRes.checkOut).format(
    'YYYY-MM-DDT12:00:00[Z]'
  );

  return new Promise((resolve, reject) => {
    if (
      updatedRes.Checked === 1 &&
      currRes[updatedRes.RoomID - 101].BookingID &&
      currRes[updatedRes.RoomID - 101].BookingID !== updatedRes.BookingID
    ) {
      reject(new Error('Cannot Update Into Occupied Room'));
    } else if (
      updatedRes.Checked !== 1 &&
      moment(updatedRes.checkIn).isAfter(pendingThreshold)
    ) {
      // Move reservation in Current to Pending Collection as checkIn date is beyond threshold
      // UNLESS reservation is already checked in
      axios
        .put(
          `/api/reservation/CurrReservation?bookingid=${updatedRes.BookingID}&dateChange=true&roomType=${roomType}`,
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
                updateCheckIn(checkIn),
                loadPendResSuccess(newPendRes),
              ])
            );
          } else if (updatedRes.Checked === 1) {
            const newOverRes = overRes.filter(
              (res) => res.BookingID !== updatedRes.BookingID
            );
            dispatch(loadOverResSuccess(newOverRes));
          }
          dispatch(
            batchActions([
              loadFormFail(),
              hideLoading(),
              snackBarSuccess('Updated Successfully!'),
            ])
          );
        })
        .catch((err) => reject(err));
    } else {
      // Keep reservation in Current Collection as checkIn date is soon
      axios
        .put(
          `/api/reservation/CurrReservation?bookingid=${updatedRes.BookingID}&dateChange=false&roomType=${roomType}`,
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
            dispatch(loadPendResSuccess(pendRes));
          } else if (updatedRes.Checked === 0) {
            // Update in Overdue
            for (let i = 0; i < overRes.length; i++) {
              if (overRes[i].BookingID === updatedRes.BookingID) {
                overRes[i] = result.data;
                break;
              }
            }
            dispatch(loadOverResSuccess(overRes));
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
                ...result.data.UpdatedReport.Stays[`${prevRoom}`].HouseKeeping,
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
                loadCurrResSuccess(currRes),
                updateReport(dailyReport),
                updateHouseKeepingReport(houseKeepingReport),
              ])
            );
          }
          dispatch(
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
    }
  }).catch((err) => {
    dispatch(
      batchActions([loadFormFail(), hideLoading(), snackBarFail(err.message)])
    );
  });
};

// move reservations in current collection between different fields of Checked
export const moveCurrRes = (
  updatedRes,
  prevRoom,
  origin,
  destination
) => async (dispatch, getState) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  const currRes = state.currRes.reservation;
  const pendRes = state.pendRes.reservation;
  const overRes = state.overRes.reservation;

  let checkIn = state.info.CheckIn;
  let available = state.info.Available;
  let stayOvers = state.info.Stayovers;
  const dailyReport = state.reportState.report;
  const { houseKeepingReport } = state.houseKeepingState;
  const roomType = houseKeepingReport[prevRoom - 101].type;

  // Generate Proper CheckIn and CheckOut Dates
  updatedRes.checkIn = moment(updatedRes.checkIn).format('YYYY-MM-DDT12:00:00[Z]');
  updatedRes.checkOut = moment(updatedRes.checkOut).format(
    'YYYY-MM-DDT12:00:00[Z]'
  );

  return new Promise((resolve, reject) => {
    if (destination === 'arrival' && origin === 'current') {
      axios
        .put(
          `/api/reservation/CurrReservation?bookingid=${updatedRes.BookingID}&moveToArr=true&roomType=${roomType}`,
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
            ...result.data[`${prevRoom}`].HouseKeeping,
            RoomID: prevRoom,
          };
          pendRes.push(updatedRes);
          // Update info
          checkIn++;
          stayOvers--;
          available++;

          dispatch(
            batchActions([
              loadCurrResSuccess(currRes),
              loadPendResSuccess(pendRes),
              updateReport(dailyReport),
              updateHouseKeepingReport(houseKeepingReport),
              updateCheckIn(checkIn),
              updateStayOvers(stayOvers),
              updateAvailable(available),
              loadFormFail(),
              hideLoading(),
              snackBarSuccess('Moved Successfully!'),
            ])
          );
        })
        .catch((err) => reject(err));
    } else {
      // No require changes in Report so just update the reservation and dispatch the changes to the state
      axios
        .put(
          `/api/reservation/CurrReservation?bookingid=${updatedRes.BookingID}&dateChange=false&roomType=${roomType}`,
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
                updateCheckIn(checkIn),
                loadOverResSuccess(overRes),
                loadPendResSuccess(pendRes),
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
                updateCheckIn(checkIn),
                loadOverResSuccess(overRes),
                loadPendResSuccess(pendRes),
              ])
            );
          }
          dispatch(
            batchActions([
              loadFormFail(),
              hideLoading(),
              snackBarSuccess('Moved Successfully!'),
            ])
          );
        })
        .catch((err) => reject(err));
    }
  }).catch((err) => {
    dispatch(
      batchActions([loadFormFail(), hideLoading(), snackBarFail(err.message)])
    );
  });
};

// Move reservations from Current Collection to Delete Collection
export const deleteCurrRes = (BookingID) => async (dispatch, getState) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  const overRes = state.overRes.reservation;

  dispatch(showLoading());
  return new Promise((resolve, reject) => {
    axios
      .delete(`/api/reservation/CurrReservation?bookingid=${BookingID}`)
      .then(() => {
        for (let i = 0; i < overRes.length; i++) {
          if (overRes[i].BookingID === BookingID) {
            overRes.splice(i, 1);
          }
        }

        dispatch(
          batchActions([
            loadOverResSuccess(overRes),
            loadFormFail(),
            hideLoading(),
            snackBarSuccess('Moved Successfully!'),
          ])
        );
      })
      .catch((err) => reject(err));
  }).catch((err) => {
    dispatch(
      batchActions([loadFormFail(), hideLoading(), snackBarFail(err.message)])
    );
  });
};

export const checkInRes = (resObj) => async (dispatch, getState) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  let pending = state.pendRes.reservation;
  const current = state.currRes.reservation;

  let checkIn = state.info.CheckIn;
  let available = state.info.Available;
  let stayOvers = state.info.Stayovers;
  const dailyReport = state.reportState.report;
  const { houseKeepingReport } = state.houseKeepingState;
  const roomType = houseKeepingReport[resObj.RoomID - 101].type;

  // Generate Proper CheckIn and CheckOut Dates
  resObj.checkIn = moment(resObj.checkIn).format('YYYY-MM-DDT12:00:00[Z]');
  resObj.checkOut = moment(resObj.checkOut).format(
    'YYYY-MM-DDT12:00:00[Z]'
  );

  return new Promise((resolve, reject) => {
    if (current[resObj.RoomID - 101].BookingID) {
      reject(new Error('Cannot Check In Guest into Occupied Room'));
    } else {
      axios
        .put(
          `/api/reservation/CurrReservation?bookingid=${resObj.BookingID}&checkIn=true&roomType=${roomType}`,
          {
            ...resObj,
            Checked: 1,
          }
        )
        .then((result) => {
          // update pending and current reservation state
          pending = pending.filter((res) => res.BookingID !== resObj.BookingID);
          current[resObj.RoomID - 101] = result.data.UpdatedRes;

          // Update DailyReport and HouseKeeping State
          dailyReport[resObj.RoomID - 101] = {
            ...result.data.UpdatedReport.Stays[`${resObj.RoomID}`].Room,
            RoomID: resObj.RoomID,
          };
          houseKeepingReport[resObj.RoomID - 101] = {
            ...result.data.UpdatedReport.Stays[`${resObj.RoomID}`].HouseKeeping,
            RoomID: resObj.RoomID,
          };

          // Update Info
          checkIn--;
          available--;
          stayOvers++;
          dispatch(
            batchActions([
              updateCheckIn(checkIn),
              updateAvailable(available),
              updateStayOvers(stayOvers),
              loadPendResSuccess(pending),
              loadCurrResSuccess(current),
              updateReport(dailyReport),
              updateHouseKeepingReport(houseKeepingReport),
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
    dispatch(
      batchActions([loadFormFail(), hideLoading(), snackBarFail(err.message)])
    );
  });
};

export const checkOutRes = (resObj) => async (dispatch, getState) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  const current = state.currRes.reservation;

  let available = state.info.Available;
  let stayOvers = state.info.Stayovers;
  const dailyReport = state.reportState.report;
  const { houseKeepingReport } = state.houseKeepingState;
  const roomType = houseKeepingReport[resObj.RoomID - 101].type;

  return axios
    .post(`/api/resCustomer/checkOutReservation?roomType=${roomType}`, resObj)
    .then((response) => {
      const prevRoom = response.data.Room.RoomID;
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
          updateAvailable(available),
          updateStayOvers(stayOvers),
          loadCurrResSuccess(current),
          updateReport(dailyReport),
          updateHouseKeepingReport(houseKeepingReport),
          loadFormFail(),
          hideLoading(),
          snackBarSuccess('Checked Out Guest'),
        ])
      );
    })
    .catch((err) => {
      dispatch(
        batchActions([loadFormFail(), hideLoading(), snackBarFail(err.message)])
      );
    });
};

// update Reservations in Pending Collection
export const updateReservation = (updatedRes) => async (dispatch, getState) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());

  // to check if updated date is past threshold
  const threshold = moment().add(2, 'days');

  const pendRes = state.pendRes.reservation;
  const searchResult = state.searchResultState.results;
  let checkIn = state.info.CheckIn;

  // Generate Proper CheckIn and CheckOut Dates
  updatedRes.checkIn = moment(updatedRes.checkIn).format('YYYY-MM-DDT12:00:00[Z]');
  updatedRes.checkOut = moment(updatedRes.checkOut).format(
    'YYYY-MM-DDT12:00:00[Z]'
  );

  if (threshold.isSameOrAfter(moment(updatedRes.checkIn))) {
    // check-in date is within threshold so update into Current
    return axios
      .put(
        `/api/reservation/PendingReservation?bookingid=${updatedRes.BookingID}&dateChange=true`,
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
            updateCheckIn(checkIn),
            loadSearchResultSuccess(searchResult),
            loadPendResSuccess(pendRes),
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
      `/api/reservation/PendingReservation?bookingid=${updatedRes.BookingID}&dateChange=false`,
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
};

export const updateDelReservation = (updatedRes) => async (
  dispatch,
  getState
) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());

  // Generate Proper CheckIn and CheckOut Dates
  updatedRes.checkIn = moment(updatedRes.checkIn).format('YYYY-MM-DDT12:00:00[Z]');
  updatedRes.checkOut = moment(updatedRes.checkOut).format(
    'YYYY-MM-DDT12:00:00[Z]'
  );

  return axios
    .put(`/api/reservation/delreservations`, updatedRes)
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
};

// Move reservation from Pending into Delete Collection
export const cancelReservation = (BookingID) => async (dispatch, getState) => {
  const state = getState();

  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  return axios
    .delete(`/api/reservation/PendingReservation?BookingID=${BookingID}`)
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
};

export const permDelReservation = (BookingID) => async (dispatch, getState) => {
  const state = getState();
  if (!state.authState.isAuthenticated) return null;

  dispatch(showLoading());
  return axios
    .delete(`/api/reservation/delreservations?BookingID=${BookingID}`)
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
};

/**
 * Staff Actions
 */

export const LOAD_ALL_STAFF = 'LOAD_ALL_STAFF';
export const loadAllStaff = (staffArray) => ({
  type: LOAD_ALL_STAFF,
  payload: {
    staffArray,
  },
});

export const LOAD_STAFF_FAIL = 'LOAD_STAFF_FAIL';
export const loadStaffFail = () => ({
  type: LOAD_STAFF_FAIL,
});

export const ADD_NEW_STAFF = 'ADD_NEW_STAFF';
export const addNewStaff = (newStaff) => ({
  type: ADD_NEW_STAFF,
  payload: {
    newStaff,
  },
});

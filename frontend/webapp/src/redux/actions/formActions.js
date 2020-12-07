// SEARCH FORM ACTIONS
export const LOAD_FORM = 'LOAD_FORM';
export const loadForm = () => ({
  type: LOAD_FORM,
});

export const LOAD_FORM_WITH_ROOM = 'LOAD_FORM_WITH_ROOM';
export const loadFormWithRoom = (room) => ({
  type: LOAD_FORM_WITH_ROOM,
  payload: {
    room,
  },
});

export const LOAD_FORM_FAILURE = 'LOAD_FORM_FAILURE';
export const loadFormFail = () => ({
  type: LOAD_FORM_FAILURE,
});

// Checked = 1 => Already checked in
export const LOAD_CURR_FORM_WITH_DATA = 'LOAD_CURR_FORM_WITH_DATA';
export const loadCurFormWithData = (resData) => ({
  type: LOAD_CURR_FORM_WITH_DATA,
  payload: {
    resData,
  },
});

// Checked = 2 => Arriving Reservation
export const LOAD_PEND_FORM_WITH_DATA = 'LOAD_PEND_FORM_WITH_DATA';
export const loadPendFormWithData = (resData) => ({
  type: LOAD_PEND_FORM_WITH_DATA,
  payload: {
    resData,
  },
});

// Checked = 0 => Overdue Reservation
export const LOAD_OVER_FORM_WITH_DATA = 'LOAD_OVER_FORM_WITH_DATA';
export const loadOverFormWithData = (resData) => ({
  type: LOAD_OVER_FORM_WITH_DATA,
  payload: {
    resData,
  },
});

export const LOAD_SEARCH_FORM_WITH_RES_DATA = 'LOAD_SEARCH_FORM_WITH_RES_DATA';
export const loadSearchFormWithResData = (resData) => ({
  type: LOAD_SEARCH_FORM_WITH_RES_DATA,
  payload: {
    resData,
  },
});

export const LOAD_SEARCH_FORM_WITH_DEL_DATA = 'LOAD_SEARCH_FORM_WITH_DEL_DATA';
export const loadSearchFormWithDelData = (resData) => ({
  type: LOAD_SEARCH_FORM_WITH_DEL_DATA,
  payload: {
    resData,
  },
});

export const LOAD_SEARCH_FORM_WITH_CUST_DATA =
  'LOAD_SEARCH_FORM_WITH_CUST_DATA';
export const loadSearchFormWithCustData = (resData) => ({
  type: LOAD_SEARCH_FORM_WITH_CUST_DATA,
  payload: {
    resData,
  },
});

export const LOAD_SEARCH_FORM_WITH_BL_CUST_DATA =
  'LOAD_SEARCH_FORM_WITH_BL_CUST_DATA';
export const loadSearchFormWithBLCustData = (resData) => ({
  type: LOAD_SEARCH_FORM_WITH_BL_CUST_DATA,
  payload: {
    resData,
  },
});

export const LOAD_FORM_WITH_STAFF_DATA = 'LOAD_FORM_WITH_STAFF_DATA';

export const loadFormWithStaffData = (staff) => ({
  type: LOAD_FORM_WITH_STAFF_DATA,
  payload: {
    staff,
  },
});

export const LOAD_FORM_F0R_NEW_STAFF = 'LOAD_FORM_F0R_NEW_STAFF';

export const loadFormForNewStaff = () => ({
  type: LOAD_FORM_F0R_NEW_STAFF,
});

import {
  LOAD_FORM,
  LOAD_FORM_FAILURE,
  LOAD_FORM_WITH_ROOM,
  LOAD_CURR_FORM_WITH_DATA,
  LOAD_PEND_FORM_WITH_DATA,
  LOAD_OVER_FORM_WITH_DATA,
  LOAD_SEARCH_FORM_WITH_RES_DATA,
  LOAD_SEARCH_FORM_WITH_DEL_DATA,
  LOAD_SEARCH_FORM_WITH_CUST_DATA,
  LOAD_SEARCH_FORM_WITH_BL_CUST_DATA,
  LOAD_FORM_WITH_STAFF_DATA,
  LOAD_FORM_F0R_NEW_STAFF,
  LOAD_FORM_F0R_NEW_BLCUST,
} from '../actions/formActions';

/**
 * The Form State Determines the data that rendered from the form as
 * well as where that data is representing and coming from to determine
 * appropriate submit actions
 *
 * List:
 * 0: New Reservation
 * 1: Current Reservation w/ Checked = 1
 * 2: Current Reservation w/ Checked = 2
 * 3: Current Reservation w/ Checked = 0
 * 4: Search Result from Reservation
 * 5: Search Result from Deleted Reservation
 * 6: Search Result from Customer
 * 7: Search Result from BlackList Customer
 * 8: Staff Information with Data
 * 9: Create New Staff Form
 * 10: New BlackList Customer with no prev Record
 */
const initialFormState = {
  open: false,
  list: 0, // which list is rendering form
  data: {},
};

const formState = (state = initialFormState, action) => {
  const { type, payload } = action;
  switch (type) {
    case LOAD_FORM_FAILURE: {
      return {
        ...state,
        open: false,
      };
    }
    case LOAD_FORM: {
      return {
        ...state,
        open: true,
        list: 0,
        data: {},
      };
    }
    case LOAD_FORM_WITH_ROOM: {
      // Load empty form for new reservation with just the room
      const { room } = payload;
      return {
        ...state,
        open: true,
        list: 0,
        data: room,
      };
    }
    case LOAD_CURR_FORM_WITH_DATA: {
      const { resData } = payload;
      return {
        ...state,
        open: true,
        list: 1,
        data: resData,
      };
    }
    case LOAD_PEND_FORM_WITH_DATA: {
      const { resData } = payload;
      return {
        ...state,
        open: true,
        list: 2,
        data: resData,
      };
    }
    case LOAD_OVER_FORM_WITH_DATA: {
      const { resData } = payload;
      return {
        ...state,
        open: true,
        list: 3,
        data: resData,
      };
    }
    case LOAD_SEARCH_FORM_WITH_RES_DATA: {
      const { resData } = payload;
      return {
        ...state,
        open: true,
        list: 4,
        data: resData,
      };
    }
    case LOAD_SEARCH_FORM_WITH_DEL_DATA: {
      const { resData } = payload;
      return {
        ...state,
        open: true,
        list: 5,
        data: resData,
      };
    }
    case LOAD_SEARCH_FORM_WITH_CUST_DATA: {
      const { resData } = payload;
      return {
        ...state,
        open: true,
        list: 6,
        data: resData,
      };
    }
    case LOAD_SEARCH_FORM_WITH_BL_CUST_DATA: {
      const { resData } = payload;
      return {
        ...state,
        open: true,
        list: 7,
        data: resData,
      };
    }
    case LOAD_FORM_WITH_STAFF_DATA: {
      const { staff } = payload;
      return {
        ...state,
        open: true,
        list: 8,
        data: staff,
      };
    }
    case LOAD_FORM_F0R_NEW_STAFF: {
      return {
        ...state,
        open: true,
        list: 9,
        data: {},
      };
    }
    case LOAD_FORM_F0R_NEW_BLCUST: {
      return {
        ...state,
        open: true,
        list: 10,
        data: {},
      };
    }
    default: {
      return state;
    }
  }
};

export default formState;

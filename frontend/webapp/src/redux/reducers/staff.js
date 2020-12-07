import { LOAD_ALL_STAFF, LOAD_STAFF_FAIL } from '../actions/staffActions';

const initialState = {
  staff: [],
};
const staffState = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case LOAD_ALL_STAFF: {
      const { staffArray } = payload;
      return {
        staff: staffArray,
      };
    }

    case LOAD_STAFF_FAIL: {
      return {
        ...state,
      };
    }

    default: {
      return state;
    }
  }
};

export default staffState;

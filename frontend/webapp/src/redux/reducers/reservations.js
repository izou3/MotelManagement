import {
  LOAD_RESERVATION_INPROGRESS,
  LOAD_RESERVATION_FAILURE,
  LOAD_CURR_RESERVATION_SUCCESS,
  LOAD_PEND_RESERVATION_SUCCESS,
  LOAD_OVER_RESERVATION_SUCCESS,
  UPDATE_STAYOVERS,
  UPDATE_CHECKIN,
  UPDATE_CHECKOUT,
  UPDATE_AVAILABLE,
} from '../actions/actions';

const initialInfoState = {
  Stayovers: 0,
  CheckIn: 0,
  CheckOut: 0,
  Available: 0,
};

export const info = (state = initialInfoState, action) => {
  const { type, payload } = action;

  switch (type) {
    case UPDATE_STAYOVERS: {
      const { num } = payload;
      return {
        ...state,
        Stayovers: num,
      };
    }
    case UPDATE_AVAILABLE: {
      const { num } = payload;
      return {
        ...state,
        Available: num,
      };
    }
    case UPDATE_CHECKIN: {
      const { num } = payload;
      return {
        ...state,
        CheckIn: num,
      };
    }
    case UPDATE_CHECKOUT: {
      const { num } = payload;
      return {
        ...state,
        CheckOut: num,
      };
    }
    default: {
      return state;
    }
  }
};

const initialState = {
  isLoading: false,
  reservation: [],
};

export const currRes = (state = initialState, action) => {
  // default value of state
  const { type, payload } = action;

  switch (type) {
    case LOAD_CURR_RESERVATION_SUCCESS: {
      const { resList } = payload;
      return {
        ...state,
        isLoading: false,
        reservation: resList,
      };
    }
    case LOAD_RESERVATION_INPROGRESS: {
      return {
        ...state,
        isLoading: true,
      };
    }
    case LOAD_RESERVATION_FAILURE: {
      return {
        ...state,
        isLoading: false,
      };
    }
    default: {
      return state; // Must do this
    }
  }
};

export const pendRes = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case LOAD_PEND_RESERVATION_SUCCESS: {
      const { resList } = payload;
      return {
        ...state,
        isLoading: false,
        reservation: resList,
      };
    }
    case LOAD_RESERVATION_INPROGRESS: {
      return {
        ...state,
        isLoading: true,
      };
    }
    case LOAD_RESERVATION_FAILURE: {
      return {
        ...state,
        isLoading: false,
      };
    }
    default: {
      return state;
    }
  }
};

export const overRes = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case LOAD_OVER_RESERVATION_SUCCESS: {
      const { resList } = payload;
      return {
        ...state,
        isLoading: false,
        reservation: resList,
      };
    }
    case LOAD_RESERVATION_INPROGRESS: {
      return {
        ...state,
        isLoading: true,
      };
    }
    case LOAD_RESERVATION_FAILURE: {
      return {
        ...state,
        isLoading: false,
      };
    }
    default: {
      return state; // Must do this
    }
  }
};

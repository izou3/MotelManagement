import {
  LOAD_SEARCH_RESULT_SUCCESS,
  LOAD_SEARCH_RESULT_IN_PROGRESS,
  LOAD_SEARCH_RESULT_FAIL,
  SEARCH_NONE,
  SEARCH_RESERVATION,
  SEARCH_DEL_RESERVATION,
  SEARCH_CUSTOMER,
  SEARCH_BLACKLIST_CUSTOMER,
} from '../actions/searchActions';

const initialSearchState = {
  searchType: 'none',
  results: [],
};
const searchResultState = (state = initialSearchState, action) => {
  const { type, payload } = action;
  switch (type) {
    case LOAD_SEARCH_RESULT_SUCCESS: {
      const { results } = payload;
      return {
        ...state,
        results,
      };
    }
    case LOAD_SEARCH_RESULT_IN_PROGRESS: {
      return {
        ...state,
        results: [],
      };
    }
    case LOAD_SEARCH_RESULT_FAIL: {
      return {
        ...state,
        results: [],
      };
    }
    case SEARCH_NONE: {
      return {
        ...state,
        searchType: 'none',
      };
    }
    case SEARCH_RESERVATION: {
      return {
        ...state,
        searchType: 'reservation',
      };
    }
    case SEARCH_DEL_RESERVATION: {
      return {
        ...state,
        searchType: 'delReservation',
      };
    }
    case SEARCH_CUSTOMER: {
      return {
        ...state,
        searchType: 'customer',
      };
    }
    case SEARCH_BLACKLIST_CUSTOMER: {
      return {
        ...state,
        searchType: 'blacklistCustomer',
      };
    }
    default: {
      return state; // Must do this
    }
  }
};

export default searchResultState;

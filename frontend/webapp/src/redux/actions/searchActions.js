/** **************************************************************
 * Actions for the searchResultState in changing the Results field
 **************************************************************** */

export const LOAD_SEARCH_RESULT_SUCCESS = 'LOAD_SEARCH_RESULT_SUCCESS';
export const loadSearchResultSuccess = (results) => ({
  type: LOAD_SEARCH_RESULT_SUCCESS,
  payload: { results },
});

export const LOAD_SEARCH_RESULT_FAIL = 'LOAD_SEARCH_RESULT_FAIL';
export const loadSearchResultFail = () => ({
  type: LOAD_SEARCH_RESULT_FAIL,
});

export const LOAD_SEARCH_RESULT_IN_PROGRESS = 'LOAD_SEARCH_RESULT_FAIL';
export const loadSearchResultInProgress = () => ({
  type: LOAD_SEARCH_RESULT_IN_PROGRESS,
});

/** **************************************************************
 * Actions for the searchResultState in changing the searchType field
 **************************************************************** */
export const SEARCH_NONE = 'SEARCH_NONE';
export const searchNone = () => ({
  type: SEARCH_NONE,
});

export const SEARCH_RESERVATION = 'SEARCH_RESERVATION ';
export const searchByReservation = () => ({
  type: SEARCH_RESERVATION,
});

export const SEARCH_DEL_RESERVATION = 'SEARCH_DEL_RESERVATION';
export const searchByDelRes = () => ({
  type: SEARCH_DEL_RESERVATION,
});

export const SEARCH_CUSTOMER = 'SEARCH_CUSTOMER';
export const searchByCustomer = () => ({
  type: SEARCH_CUSTOMER,
});

export const SEARCH_BLACKLIST_CUSTOMER = 'SEARCH_BLACKLIST_CUSTOMER';
export const searchByBlackListCustomer = () => ({
  type: SEARCH_BLACKLIST_CUSTOMER,
});

/**
 * Defined Actions for Authentication
 */

export const LOGIN_USER = 'LOGIN_USER';
export const loginUser = (userInfo, motelInfo, motelRoom) => ({
  type: LOGIN_USER,
  payload: {
    userInfo,
    motelInfo,
    motelRoom,
  },
});

export const LOGOUT_USER = 'LOGOUT_USER';
export const logoutUser = () => ({
  type: LOGOUT_USER,
});

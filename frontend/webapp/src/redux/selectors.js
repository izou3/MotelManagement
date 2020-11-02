import { createSelector } from 'reselect';

export const getCurrRes = (state) => state.currRes.reservation;
export const getCurrResLoading = (state) => state.currRes.isLoading;

export const getPendRes = (state) => state.pendRes.reservation;
export const getPendResLoading = (state) => state.pendRes.isLoading;

export const getOverRes = (state) => state.overRes.reservation;
export const getOverResLoading = (state) => state.overRes.isLoading;

// export const getCurrentRes = createSelector(
//     getReservation,
//     (todos) => {
//         todos.filter(todo => !todo.isCompleted)
//     },
// );

// export const getCompleteTodos = createSelector(
//     getToDos,
//     (todos) => todos.filter(todo => todo.isCompleted),
// );

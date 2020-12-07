const { celebrate, Joi, Segments } = require('celebrate');

/**
 * @Note If you validate with key that is not present
 * in the object, celebrate will throw error.
 * However, if you validate an object without a specific key that
 * is specified in the celebrate Joi object, celebrate will ignore it
 *
 * For instance, in ValidateCreateReservation, if you validate
 * against an object with key `random`that is NOT specified in
 * the celebrate object, you will get a validation error.
 *
 * However, if you validate against an object without keys like
 * email or phone, Joi will ignore those
 *
 * SO BEST PRACTICE TO INCLUDE ALL POSSIBLE KEYS
 */
module.exports = {
  ValidateCreateReservation: celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().empty('').default(''),
      phone: Joi.alternatives().try(
        Joi.number(),
        Joi.string().empty('').default(0)
      ), // Due to Frontend Form InitialValues
      comments: Joi.string().allow('').max(250),
      YearID: Joi.number().integer().max(2030).required(),
      MonthID: Joi.number().integer().min(1).max(12).required(),
      HotelID: Joi.number().required(),
      BookingID: Joi.number().required(),
      CustomerID: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      ReservationID: Joi.number().integer().min(0).max(5).required(),
      PaymentID: Joi.number().integer().min(0).max(5).required(),
      RoomID: Joi.number().integer().min(100).max(300).required(),
      StateID: Joi.string().empty('').default(''),
      pricePaid: Joi.number().required(),
      tax: Joi.number().required(),
      checkIn: Joi.date().required(),
      checkOut: Joi.date().required(),
      numGuests: Joi.number().integer().min(0).required(),
      Checked: Joi.number().integer().min(0).max(3).required(),
      StyleID: Joi.number().integer().min(0).max(5).required(),
    }),
  }),

  ValidateUpdateReservation: celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().empty('').default(''),
      phone: Joi.alternatives().try(
        Joi.number(),
        Joi.string().empty('').default(0)
      ), // Due to Frontend Form InitialValues
      comments: Joi.string().allow('').max(250),
      YearID: Joi.number().integer().max(2030),
      MonthID: Joi.number().integer().min(1).max(12),
      HotelID: Joi.number(),
      BookingID: Joi.number().integer().required(),
      CustomerID: Joi.string(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      ReservationID: Joi.number().integer().min(0).max(5).required(),
      PaymentID: Joi.number().integer().min(0).max(5).required(),
      RoomID: Joi.number().integer().min(100).max(300).required(),
      StateID: Joi.string().empty('').default(''),
      pricePaid: Joi.number().required(),
      tax: Joi.number().required(),
      checkIn: Joi.date().required(),
      checkOut: Joi.date().required(),
      numGuests: Joi.number().integer().min(0).required(),
      Checked: Joi.number().integer().min(0).max(3).required(),
      StyleID: Joi.number().integer().min(0).max(5).required(),
    }),
  }),

  RequireBookingID: celebrate({
    [Segments.QUERY]: {
      HotelID: Joi.number().integer().required(),
      BookingID: Joi.number().integer().required(),
    },
  }),
};

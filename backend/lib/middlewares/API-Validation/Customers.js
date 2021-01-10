const { celebrate, Joi, Segments } = require('celebrate');

module.exports = {
  ValidateCreateCustomer: celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().trim().empty('').default(''),
      phone: Joi.alternatives().try(
        Joi.number(),
        Joi.string().empty('').default(0)
      ), // Due to Frontend Form InitialValues
      comments: Joi.string().trim().allow('').max(250),
      YearID: Joi.number().integer().max(2030).required(),
      MonthID: Joi.number().integer().min(1).max(12).required(),
      HotelID: Joi.number().required(),
      BookingID: Joi.number().required(),
      CustomerID: Joi.string().trim().required(),
      firstName: Joi.string().trim().required(),
      lastName: Joi.string().trim().required(),
      ReservationID: Joi.number().integer().min(0).max(5).required(),
      PaymentID: Joi.number().integer().min(0).max(5).required(),
      RoomID: Joi.number().integer().min(100).max(300).required(),
      StateID: Joi.string().empty('').default(''),
      pricePaid: Joi.number().required(),
      tax: Joi.number().required(),
      checkIn: Joi.date().required(),
      checkOut: Joi.date().required(),
      numGuests: Joi.number().integer().min(0).required(),
      StyleID: Joi.number().integer().min(0).max(5).required(),
      Checked: Joi.number(),
    }),
  }),

  ValidateUpdateCustomer: celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().trim().empty('').default(''),
      phone: Joi.alternatives().try(
        Joi.number(),
        Joi.string().empty('').default(0)
      ), // Due to Frontend Form InitialValues
      comments: Joi.string().allow('').max(250),
      YearID: Joi.number().integer().max(2030),
      MonthID: Joi.number().integer().min(1).max(12),
      HotelID: Joi.number(),
      BookingID: Joi.number().integer().required(),
      CustomerID: Joi.string().trim(),
      firstName: Joi.string().trim().required(),
      lastName: Joi.string().trim().required(),
      ReservationID: Joi.number().integer().min(0).max(5).required(),
      PaymentID: Joi.number().integer().min(0).max(5).required(),
      RoomID: Joi.number().integer().min(100).max(300).required(),
      StateID: Joi.string().trim().empty('').default(''),
      pricePaid: Joi.number().required(),
      tax: Joi.number().required(),
      checkIn: Joi.date().required(),
      checkOut: Joi.date().required(),
      numGuests: Joi.number().integer().min(0).required(),
      StyleID: Joi.number().integer().min(0).max(5).required(),
      Checked: Joi.number(),
    }),
  }),

  // No BookingID, CustomerID, ect b/c generated on server side
  ValidateNewBlackListCustomer: celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().trim().empty('').default(''),
      phone: Joi.alternatives().try(
        Joi.number(),
        Joi.string().empty('').default(0)
      ), // Due to Frontend Form InitialValues
      comments: Joi.string().allow('').max(250),
      HotelID: Joi.number(),
      firstName: Joi.string().trim().required(),
      lastName: Joi.string().trim().required(),
      ReservationID: Joi.number().integer().min(0).max(5).required(),
      PaymentID: Joi.number().integer().min(0).max(5).required(),
      RoomID: Joi.number().integer().min(100).max(300).required(),
      StateID: Joi.string().trim().empty('').default(''),
      pricePaid: Joi.number().required(),
      tax: Joi.number().required(),
      checkIn: Joi.date().required(),
      checkOut: Joi.date().required(),
      numGuests: Joi.number().integer().min(0).required(),
      StyleID: Joi.number().integer().min(0).max(5).required(),
      Checked: Joi.number(),
    }),
  }),
};

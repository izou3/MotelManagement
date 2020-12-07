const { celebrate, Joi, Segments } = require('celebrate');

module.exports = {
  ValidateSearchByName: celebrate({
    [Segments.QUERY]: {
      HotelID: Joi.number().integer().required(),
      firstName: Joi.string().required(),
    },
  }),

  ValidateSearchByBookingID: celebrate({
    [Segments.QUERY]: {
      HotelID: Joi.number().integer().required(),
      BookingID: Joi.number().integer().required(),
    },
  }),

  ValidateSearchByDate: celebrate({
    [Segments.QUERY]: {
      HotelID: Joi.number().integer().required(),
      start: Joi.date().required(),
      end: Joi.date().required(),
    },
  }),
};

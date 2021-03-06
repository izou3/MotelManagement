const { celebrate, Joi, Segments } = require('celebrate');
const moment = require('moment');

module.exports = {
  ValidateMaintenanceName: celebrate({
    [Segments.QUERY]: {
      HotelID: Joi.number().integer().required(),
      name: Joi.string().required(),
    },
  }),

  ValidateLogEntry: celebrate({
    [Segments.QUERY]: {
      HotelID: Joi.number().integer().required(),
      name: Joi.string().required(),
      field: Joi.required(),
    },
    [Segments.BODY]: Joi.object().keys({
      _id: Joi.string(),
      completed: Joi.boolean().empty(null).default(false),
      date: Joi.date()
        .empty(null)
        .default(moment().format('YYYY-MM-DDT12:00:00[Z]')),
      description: Joi.string().empty(['', null]).default(''),
      cost: Joi.number().empty(null).default(0),
    }),
  }),

  ValidateDeleteEntry: celebrate({
    [Segments.QUERY]: {
      HotelID: Joi.number().integer().required(),
      name: Joi.string().required(),
      field: Joi.required(),
      entryID: Joi.string().required(),
    },
  }),
};

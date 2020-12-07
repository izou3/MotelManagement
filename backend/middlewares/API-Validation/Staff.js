const { celebrate, Joi, Segments } = require('celebrate');

module.exports = {
  ValidateNewStaff: celebrate({
    [Segments.BODY]: Joi.object().keys({
      HotelID: Joi.number().integer().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      username: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      position: Joi.valid(0, 1, 2).required(),
    }),
  }),

  ValidateUpdateStaff: celebrate({
    [Segments.BODY]: Joi.object().keys({
      HotelID: Joi.number().integer(),
      firstName: Joi.string(),
      lastName: Joi.string(),
      username: Joi.string(),
      email: Joi.string().email(),
      password: Joi.forbidden(),
      position: Joi.valid(0, 1, 2),
    }),
  }),

  ValidateDeleteStaff: celebrate({
    [Segments.QUERY]: {
      HotelID: Joi.number().integer().required(),
      username: Joi.string().required(),
    },
  }),
};

const { celebrate, Joi, Segments } = require('celebrate');
const moment = require('moment');

module.exports = {
  ValidateDate: celebrate({
    [Segments.QUERY]: {
      HotelID: Joi.number().integer().required(),
      date: Joi.date().required(),
    },
  }),

  ValidateRoomRecord: celebrate({
    [Segments.BODY]: Joi.object().keys({
      _id: Joi.string(),
      RoomID: Joi.number(),
      BookingID: Joi.number().integer().required(),
      type: Joi.string().allow('').valid('N', 'S/O', 'WK1', 'WK2', 'WK3', 'NO'),
      payment: Joi.string().allow('').valid('C', 'CC'),
      startDate: Joi.date()
        .empty(['', null])
        .default(moment().format('YYYY-MM-DDT12:00:00[Z]')),
      endDate: Joi.date().required(),
      paid: Joi.boolean().required(),
      rate: Joi.number().default(0),
      tax: Joi.number().default(0),
      notes: Joi.string().allow('').default(''),
      initial: Joi.string().allow('').default(''),
    }),
  }),

  ValidateHouseKeepingRecord: celebrate({
    [Segments.QUERY]: {
      HotelID: Joi.number().integer().required(),
      date: Joi.date().required(),
    },
    [Segments.BODY]: Joi.object().keys({
      _id: Joi.string(),
      RoomID: Joi.number().integer().required(),
      status: Joi.string().required(),
      type: Joi.string().required(),
      houseKeeper: Joi.string().allow('').default(''),
      notes: Joi.string().allow('').default(''),
    }),
  }),

  ValidateRefundRecord: celebrate({
    [Segments.BODY]: Joi.object().keys({
      _id: Joi.string(),
      date: Joi.date().required(),
      amount: Joi.number().default(0),
      notes: Joi.string().allow('').default(''),
    }),
  }),

  ValidateTaxReportRequest: celebrate({
    [Segments.QUERY]: {
      HotelID: Joi.number().integer().required(),
      MonthID: Joi.number().integer().min(1).max(12).required(),
      YearID: Joi.number().integer().min(2019).max(2030).required(),
    },
  }),
};

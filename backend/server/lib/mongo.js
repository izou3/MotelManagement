const mongoose = require('mongoose');

/**
 * Create Global Mongo Connection
 */
module.exports.connectMongo = (dsn) =>
  mongoose
    .connect(dsn, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      poolSize: 10,
    })
    .then(() => mongoose.connection)
    .catch(() => {
      throw new Error('Failed Connection');
    });

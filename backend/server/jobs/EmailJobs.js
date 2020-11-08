const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const pug = require('pug');

const { OAuth2 } = google.auth;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
});
const accessToken = oauth2Client.getAccessToken();

const smtpTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: process.env.GOOGLE_AUTH_TYPE,
    user: process.env.GMAIL_HOST_ADRESS,
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
    accessToken,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = (agenda, config) => {
  agenda.define('ReservationConfirmation', (job, done) => {
    const mailOptions = {
      from: process.env.GMAIL_HOST_ADRESS,
      to: job.attrs.data.email,
      subject: process.env.GMAIL_EMAIL_SUBJECT_LINE,
      generateTextFromHTML: true,
      html: pug.renderFile(config.emailTemplatePath, {
        firstName: job.attrs.data.firstName,
        lastName: job.attrs.data.lastName,
        numGuests: job.attrs.data.numGuests,
        checkIn: job.attrs.data.checkIn,
        checkOut: job.attrs.data.checkOut,
        pricePaid: job.attrs.data.pricePaid,
      }),
    };

    smtpTransport.sendMail(mailOptions, (error) => {
      if (error) {
        done(error);
      } else {
        done();
      }
      smtpTransport.close();
    });
  });
};

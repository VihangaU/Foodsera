// smsService.js
require('dotenv').config();
const twilio = require('twilio');

const client = new twilio(
  'ACc048913ab795e7779b682de168afed77',
  '20589c2c2f66bf1ad8edeb12e352a3c5'
);

const sendSMS = (to, message) => {
  return client.messages.create({
    body: message,
    from: '+19472177830',
    to: to,
  });
};

module.exports = sendSMS;
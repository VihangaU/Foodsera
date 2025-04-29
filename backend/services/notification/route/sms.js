const express = require('express');
const router = express.Router();
const sendSMS = require('../util/smsService');
const sendEmail = require('../util/emailService');

router.post('/send-sms', async (req, res) => {
  const { to, message } = req.body;
  try {
    // const result = await sendSMS(to, message);
    // res.status(200).json({ success: true, sid: result.sid });

    console.log('done',to , message)
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/send-email', async (req, res) => {
  const { to, subject, html } = req.body;
  
  try {
    const result = await sendEmail(to, subject, html);
    res.status(200).json({ 
      success: true, 
      messageId: result.messageId 
    });
  } catch (err) {
    console.error('Email sending error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

module.exports = router;
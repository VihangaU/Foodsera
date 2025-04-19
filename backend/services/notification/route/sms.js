const express = require('express');
const router = express.Router();
const sendSMS = require('../util/smsService');

router.post('/send-sms', async (req, res) => {
  const { to, message } = req.body;
  try {
    const result = await sendSMS(to, message);
    res.status(200).json({ success: true, sid: result.sid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
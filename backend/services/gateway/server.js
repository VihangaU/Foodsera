const express = require('express');
const cors = require('cors');
const expressSession = require('express-session');
const proxy = require('express-http-proxy');

require('dotenv').config();

const app = express();

// Middleware
app.use(
  cors({
    origin: ['https://foodix.dynac.space', 'http://localhost:8082'],
    credentials: true,
  })
);
app.use(express.json());
app.set('trust proxy', 1);

// Session settings
const sessSettings = expressSession({
  secret: 'myverysecretkey',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: true,
    maxAge: 360000,
    sameSite: 'none',
  },
});
app.use(sessSettings);

// Proxy error handling
const proxyOptions = {
  proxyErrorHandler: (err, res, next) => {
    console.error('Proxy error:', err.message);
    res.status(500).json({ message: 'Proxy error', error: err.message });
  },
};

// Proxy routes
app.use('/auth-proxy', proxy('http://auth-service:5001', proxyOptions));
app.use('/delivery-proxy', proxy('http://delivery-service:5003', proxyOptions));
app.use('/order-proxy', proxy('http://order-service:5004', proxyOptions));
app.use('/restaurent-proxy', proxy('http://restaurent-service:5006', proxyOptions));
app.use('/notification-proxy', proxy('http://notification-service:5007', proxyOptions));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API Gateway is running!' });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`Gateway started at : ${PORT}`));
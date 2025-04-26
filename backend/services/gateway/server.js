const express = require("express");
const cors = require("cors");
const expressSession = require("express-session");
const proxy = require("express-http-proxy");

require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:8082", // frontend origin
    credentials: true,
  })
);
app.use(express.json());
app.set("trust proxy", 1);

// Session settings (optional for auth/session management)
const sessSettings = expressSession({
  secret: "myverysecretkey",
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false, // Use true if HTTPS
    maxAge: 360000, // Cookie lifetime
  },
});
app.use(sessSettings);

// Proxy middleware to microservices
app.use("/auth-proxy", proxy("http://localhost:5001"));
app.use("/delivery-proxy", proxy("http://localhost:5003"));

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ message: "API Gateway is running!" });
});

// Start the server
const PORT = 4000;
app.listen(PORT, "0.0.0.0", () => console.log(`Gateway started at : ${PORT}`));

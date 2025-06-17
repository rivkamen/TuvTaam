require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/dbConn");
const corsOptions = require("./config/corsOptions");

// ← ייבוא אסטרטגיית גוגל (חובה לפני passport.initialize)
require("./config/passport");

const PORT = process.env.PORT || 2023;
const app = express();

// --- מגביל בקשות ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 דקות
  max: 100, // מגביל ל־100 בקשות לכל IP ב־15 דקות
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// --- התחברות ל־MongoDB ---
connectDB();

// --- Middleware ---
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static("public"));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// --- ראוטים ---
app.use('/api/admin', require("./routes/AdminRoute"));
app.use('/api/users', require("./routes/UserRoute"));
app.use('/api/session', require("./routes/SessionRoute"));
app.use('/api/feedback', require("./routes/SessionFeedbackRoute"));
app.use('/api/auth', require("./routes/AuthRoute"));
app.use('/api/autha', require("./routes/AdminAuthRoute"));
app.use('/api/functionToken', require("./middleware/verifyJWT"));
app.use('/api/files', require('./routes/UploadRoute'));
app.use('/api/records', require('./routes/RecordRoute'));

// --- טיפול ב־404 ---
app.use((req, res) => {
  res.status(404).send("404 - Not Found");
});

// --- התחברות למסד והפעלת שרת ---
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

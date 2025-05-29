var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
var cors = require("cors");
var indexRouter = require("./routes/index");
var userRouter = require("./routes/user");
var restaurantRouter = require("./routes/restaurant");
var bookingRouter = require("./routes/booking");
var activityRouter = require("./routes/activity");
var eventRouter = require("./routes/event");
var serviceRouter = require("./routes/service");
var eventBookingRouter = require("./routes/eventBooking");
var activityBookingRouter = require("./routes/activityBooking");
var serviceBookingRouter = require("./routes/serviceBooking");
var reviewRouter = require("./routes/review");
var proxyRouter = require("./routes/proxyRoutes");
var adminRouter = require("./routes/admin");
var contactRouter = require("./routes/contact");
var app = express();
var securityMiddleware = require("./middlewares/security");
require("./config/backend");
const { createUploadDirectories } = require('./utils/init');

// Create necessary directories
createUploadDirectories();

//mount middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(securityMiddleware.checkJWT);

// Serve uploaded files
app.use('/uploads', express.static('public/uploads'));

// mount routers
app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/restaurant", restaurantRouter);
app.use("/booking", bookingRouter);
app.use("/activities", activityRouter);
app.use("/events", eventRouter);
app.use("/services", serviceRouter);
app.use("/eventbooking", eventBookingRouter);
app.use("/activitybooking", activityBookingRouter);
app.use("/servicebooking", serviceBookingRouter);
app.use("/", reviewRouter);
app.use("/api", proxyRouter);
app.use("/admin", adminRouter);
app.use("/contact", contactRouter);

// catch 404 and forward to error handler
app.use(function (req, res) {
  res.status(404).json("Not Found");
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
});

module.exports = app;

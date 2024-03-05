const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const dotenv = require("dotenv").config();

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const gameRouter = require("./routes/game");
const publisherRouter = require("./routes/publisher");
const genreRouter = require("./routes/genre");
const platformRouter = require("./routes/platform");
const debug = require("debug")("mongoose");
const compression = require("compression");
const helmet = require("helmet");

const app = express();

// Set up rate limiter: maximum of twenty requests per minute
const RateLimit = "express-rate-limit";
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute;
  max: 20,
});

const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const dev_db_url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@myatlasclusteredu.5v0vras.mongodb.net/inventory_game_store?retryWrites=true&w=majority`;

const mongoDB = process.env.MONGODB_URI || dev_db_url;
// `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@myatlasclusteredu.5v0vras.mongodb.net/local_library?retryWrites=true&w=majority`;
// Wait for database to connect, logging an error if there is a problem
async function main() {
  await mongoose.connect(mongoDB);
  debug("database is conntected");
}

main().catch((err) => debug(err.message));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Apply rate limiter to all requests
app.use(limiter);

// Add helmet to the middleware chain.
// Set CSP headers to allow our Bootstrap and Jquery to be served
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["self", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(compression()); // Compress all routes
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/game", gameRouter);
app.use("/publisher", publisherRouter);
app.use("/genre", genreRouter);
app.use("/platform", platformRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

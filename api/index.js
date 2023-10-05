const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const User = require("../models/user");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const RateLimit = require("express-rate-limit");
const compression = require("compression");
const helmet = require("helmet");

const indexRouter = require("../routes/index");

const app = express();

//database setup
// check
const mongoDb = process.env.MONGODB_URI;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

// cors
// const corsOptions = {
//   origin: "http://127.0.0.1:5173/",
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"],
//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));

// general middleware
app.use(compression());
app.use(helmet());

// parsing request
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// rate limiter
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
  trustProxy: app.get("trust proxy"),
});
app.use(limiter);

// passport
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      sameSite: "none",
      secure: true,
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// google OAUTH
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://127.0.0.1:5173/auth/google/callback",
      passReqToCallback: true,
    },
    async (accessToken, refreshToken, profile, cb) => {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = new User({
          googleId: profile.id,
          displayName: `${profile.name.givenName} ${profile.name.familyName}`,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          image: profile.photos[0].value,
        });
        await user.save();
      }
      return cb(null, user);
    },
  ),
);

//////////////

const isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
};

// Google Auth consent screen route
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  }),
);

// Call back route
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failed",
  }),
  function (req, res) {
    res.redirect("/success");
  },
);

// failed route if the authentication fails
app.get("/failed", (req, res) => {
  console.log("User is not authenticated");
  res.send("Failed");
});

// Success route if the authentication is successful
app.get("/success", isLoggedIn, (req, res) => {
  console.log("You are logged in");
  res.send(`Welcome ${req.user.displayName}`);
});

// Route that logs out the authenticated user
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error while destroying session:", err);
    } else {
      req.logout(() => {
        console.log("You are logged out");
        res.redirect("/home");
      });
    }
  });
});

//////////////////

// email/password
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (err) return done(err);
        if (!res) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      });
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

////////////////////////////////////////////////////////////////////

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

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

const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.user_signup = [
  body("username", "Username must be specified")
    .toLowerCase()
    .trim()
    .escape()
    .isLength({ min: 4, max: 60 })
    .withMessage(
      "The length of the username must be between 4 and 20 characters long",
    )
    .custom(async (username) => {
      try {
        const usernameExists = await User.findOne({ username: username });
        if (usernameExists) {
          throw new Error("Username already exists");
        }
      } catch (err) {
        throw new Error(err);
      }
    }),
  body("email")
    .trim()
    .escape()
    .isEmail()
    .withMessage("Email must be specified"),
  body("password", "Password must be specified")
    .trim()
    .escape()
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long")
    .matches("[0-9]")
    .withMessage("Password must contain a number")
    .matches("[A-Z]")
    .withMessage("Password must contain an uppercase letter"),

  async (req, res) => {
    const errors = validationResult(req);
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(req.body.password, salt);
    if (!errors.isEmpty()) {
      return res.status(403).json({
        username: req.body.username,
        errors: errors.array(),
      });
    }
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: passwordHash,
    });
    try {
      await user.save();
      return res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: "error registering user" });
    }
  },
];

exports.user_login = async function (req, res, next) {
  try {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.status(403).json({
          error: info.message || "Authentication failed",
        });
      }
      req.login(user, { session: false }, (err) => {
        if (err) {
          next(err);
        }
        // token
        const body = {
          _id: user._id,
          username: user.username,
          email: user.email,
        };
        const token = jwt.sign({ user: body }, process.env.SECRET, {
          expiresIn: "1h",
        });
        return res.status(200).json({ body, token });
      });
    })(req, res, next);
  } catch (err) {
    return res.status(500).json({
      error: "Server error",
    });
  }
};

exports.user_get = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).exec();

    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Internal error:", error);
    return res.status(500).json({ error: "error getting user" });
  }
};

const express = require("express");
const router = express.Router();
const passport = require("passport");
const user_controller = require("../controllers/userController");
const nasa_controller = require("../controllers/nasaController");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/api/login", user_controller.user_login);
router.post("/api/signup", user_controller.user_signup);

router.get("/api/nasa-daily-image", nasa_controller.get_daily_image);

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["https://www.googleapis.com/auth/plus.login"],
  }),
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home or wherever you want.
    res.redirect("/");
  },
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Here the user has been authenticated by Google
    const body = {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
    };
    const token = jwt.sign({ user: body }, process.env.SECRET, {
      expiresIn: "1h",
    });
    // Return the token or set it in a cookie or however you wish to handle
    res.json({ token });
  },
);

module.exports = router;

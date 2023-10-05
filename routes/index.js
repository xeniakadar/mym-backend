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

router.get("/auth/google", (req, res, next) => {
  console.log("Received request for /auth/google");
  next();
});

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  }),
);

router.get("/auth/google/callback", (req, res, next) => {
  console.log("Received request for /auth/google/callback");
  next();
});

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

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.send("Welcome");
  },
);

router.get("/logout", (req, res) => {
  req.logout();
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;

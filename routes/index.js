var express = require("express");
var router = express.Router();
const user_controller = require("../controllers/userController");
const nasa_controller = require("../controllers/nasaController");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/api/login", user_controller.user_login);
router.post("/api/signup", user_controller.user_signup);

router.get("/api/nasa-daily-image", nasa_controller.get_daily_image);

module.exports = router;

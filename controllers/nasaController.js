const axios = require("axios");
const jwt = require("jsonwebtoken");

exports.get_daily_image = [
  // (req, res, next) => {
  //   const bearerHeader = req.headers["authorization"];
  //   if (typeof bearerHeader !== "undefined") {
  //     const bearer = bearerHeader.split(" ");
  //     const bearerToken = bearer[1];
  //     req.token = bearerToken;
  //     jwt.verify(req.token, process.env.SECRET, (err, authData) => {
  //       if (err) {
  //         res.sendStatus(403);
  //       } else {
  //         req.authData = authData;
  //         next();
  //       }
  //     });
  //   } else {
  //     res.sendStatus(403);
  //   }
  // },
  async (req, res) => {
    try {
      const response = await axios.get("https://api.nasa.gov/planetary/apod", {
        params: {
          api_key: process.env.NASA_API_KEY,
        },
      });
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },
];

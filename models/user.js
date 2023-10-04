const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String },
  email: { type: String },
  password: { type: String },
  googleId: { type: String, unique: true },
  displayName: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  image: { type: String },
});

module.exports = mongoose.model("User", userSchema);

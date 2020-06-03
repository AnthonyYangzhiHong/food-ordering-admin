const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const UserSchema = new mongoose.Schema({
  username: String,
  hash: String,
  salt: String
});
module.exports = UserSchema
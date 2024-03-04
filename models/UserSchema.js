const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  favorites:{
    type:[],
    required:false
  }
});

const UserSchema = mongoose.model("user", schema);
module.exports = UserSchema ;

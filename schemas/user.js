const mongoose = require("mongoose");

const { Schema } = mongoose;
const UserSchema = new Schema({
  ID:{
    type: String,
    required: true,
    unique: true
  },
  nickname: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  }
});

UserSchema.virtual("userId").get(function () {
  return this._id.toHexString();
});
UserSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("User", UserSchema);
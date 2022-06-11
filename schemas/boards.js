const mongoose = require("mongoose")

const { Schema } = mongoose;
  const boardsSchema = new Schema({
    boardId: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    username : {
        type: String
    },
    content : {
        type: String,
        required: true
    },
    time : {
        type: Date,
        required: true
    }
});
boardsSchema.virtual("userId").get(function () {
    return this._id.toHexString();
  });
  boardsSchema.set("toJSON", {
    virtuals: true,
  });

module.exports = mongoose.model("Boards", boardsSchema);
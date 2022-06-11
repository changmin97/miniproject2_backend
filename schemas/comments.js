const mongoose = require("mongoose");

const { Schema } = mongoose;
  const commentSchema = new Schema({
    boardId: {
        type: Number,
    },
    username : {
        type: String,
    },
    commentId: {
      type: Number,
      required: true,
    },
    comment : {
        type: String,
        required: true
    },
    time : {
        type: Date,
        required: true
    }
});
commentSchema.virtual("userId").get(function () {
    return this._id.toHexString();
  });
  commentSchema.set("toJSON", {
    virtuals: true,
  });

module.exports = mongoose.model("Comment", commentSchema);

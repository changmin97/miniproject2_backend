const mongoose = require("mongoose");

const { Schema } = mongoose;
  const commentSchema = new Schema({
    postId: {
        type: Number,
    },
    nickname : {
        type: String,
    },
    commentId: {
      type: Number,
      required: true,
    },
    comment : {
        type: String,
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

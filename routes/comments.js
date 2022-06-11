const express = require("express");
const Comment = require("../schemas/comments");
const Post = require("../schemas/post");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");

//댓글 작성
router.post("/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { comment } = req.body;
  const { nickname } = res.locals.user;

  const maxCommentId = await Comment.findOne({ postId }).sort({
    commentId: -1,
  });
  const targetpost = await Post.findOne({ postId });
  if (targetpost === null) {
    return res
      .status(400)
      .json({ errorMessage: "존재하지 않는 게시글입니다." });
  }
  let commentId = 1;
  if (maxCommentId) {
    commentId = maxCommentId.commentId + 1;
  }

  const createdcomment = await Comment.create({
    postId,
    commentId,
    nickname,
    comment,
  });
  res.json({ targetpost: createdcomment });
});


//댓글 삭제 (수정여부 보류)
router.delete(
  "/:postId/:commentId",
  authMiddleware,
  async (req, res) => {
    const { postId } = req.params;
    const { commentId } = req.params;

    const comment = await Comment.find({ $and: [{ postId }, { commentId }] });
    if (comment) {
      await Comment.deleteOne({ commentId });
    }
    res.json({ result: true });
  }
);

// //댓글 수정

// router.put("/postId/:commentId", authMiddleware, async (req, res) => {
//   const { boardId } = req.params;
//   const { commentId } = req.params;
//   const { comment } = req.body;
//   const username = res.locals.user.username;
//   const existscomment = await Comment.find({
//     $and: [{ boardId }, { commentId }],
//   });

//   if (existscomment.length === 0) {
//     return res.json({ errorMessage: "댓글이 존재하지 않습니다." });
//   }
//   if (existscomment[0].username !== username) {
//     return res.json({ errorMessage: "본인의 쓴 댓글만 수정가능합니다." });
//   }

//   await Comment.updateOne(
//     { $and: [{ boardId }, { commentId }] },
//     { $set: { comment } }
//   );
//   res.status(200).json({ successMessage: "정상적으로 수정 완료하였습니다." });
// });

module.exports = router;

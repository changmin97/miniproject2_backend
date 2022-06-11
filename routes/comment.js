const express = require("express");
const Comment = require("../schemas/comments");
const Boards = require("../schemas/boards");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const moment = require("moment");

//댓글 작성
router.post("/boards/:boardId", authMiddleware, async (req, res) => {
  const time = moment().add("9", "h").format("YYYY-MM-DD HH:mm:ss"); //표준시와의 시차적용한 시간
  const { boardId } = req.params;
  const { comment } = req.body;
  const { username } = res.locals.user;

  const maxCommentId = await Comment.findOne({ boardId }).sort({
    commentId: -1,
  });
  const targetboard = await Boards.findOne({ boardId });
  if (targetboard === null) {
    return res
      .status(400)
      .json({ errorMessage: "존재하지 않는 게시글입니다." });
  }
  let commentId = 1;
  if (maxCommentId) {
    commentId = maxCommentId.commentId + 1;
  }

  const createdcomment = await Comment.create({
    boardId,
    commentId,
    username,
    comment,
    time,
  });
  res.json({ targetboard: createdcomment });
});
//댓글 수정
router.put("/boards/:boardId/:commentId", authMiddleware, async (req, res) => {
  const { boardId } = req.params;
  const { commentId } = req.params;
  const { comment } = req.body;
  const username = res.locals.user.username;
  const existscomment = await Comment.find({
    $and: [{ boardId }, { commentId }],
  });

  if (existscomment.length === 0) {
    return res.json({ errorMessage: "댓글이 존재하지 않습니다." });
  }
  if (existscomment[0].username !== username) {
    return res.json({ errorMessage: "본인의 쓴 댓글만 수정가능합니다." });
  }

  await Comment.updateOne(
    { $and: [{ boardId }, { commentId }] },
    { $set: { comment } }
  );
  res.status(200).json({ successMessage: "정상적으로 수정 완료하였습니다." });
});
//댓글 삭제
router.delete(
  "/boards/:boardId/:commentId",
  authMiddleware,
  async (req, res) => {
    const { boardId } = req.params;
    const { commentId } = req.params;

    const comment = await Comment.find({ $and: [{ boardId }, { commentId }] });
    if (comment) {
      await Comment.deleteOne({ commentId });
    }
    res.json({ success: true });
  }
);

module.exports = router;

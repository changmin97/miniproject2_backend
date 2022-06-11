const express = require("express");
const Boards = require('../schemas/boards');
const Comment = require('../schemas/comments');
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();
const moment = require("moment");

//전체 조회
router.get('/boards', async (req, res) => {
    const boards = await Boards
        .find({}, { boardId: 1, title: 1, time: 1, content: 1 })
        .sort({ "time": -1 });
    res.json({ boards, });
});
//게시글 한개 조회
router.get('/boards/:boardId', async (req, res) => {
    const { boardId } = req.params;
    const existsboards = await Boards
        .find({ boardId }, { boardId: 1, title: 1, content: 1, username: 1, time: 1, _id: 0 });
    if (!existsboards.length) {
        return res.status(400).json({ success: false, errorMessage: "찾는 게시물 없음." });
    }

    const existcomments = await Comment
        .find({ boardId },
            { commentId: 1, title: 1, comment: 1, username: 1, time: 1, _id: 0 })
        .sort({ time: -1 });
    res.json({ existsboards, existcomments });
});

//글 작성
router.post("/boards", authMiddleware, async (req, res) => {
    const { username } = res.locals.user;
    const { boardId, title, content } = req.body;
    const time = moment().add('9', 'h').format('YYYY-MM-DD HH:mm:ss')//표준시와의 시차적용한 시간

    const boards = await Boards.find({ boardId });
    if (boards.length) {
        return res.status(400).json({ success: false, errorMessage: "이미 있는 게시글입니다." })
    }

    const createdBoards = await Boards.create({ boardId, username, title, content, time });
    res.json({ boards: createdBoards });
});

//게시글 수정
router.put("/boards/:boardId", authMiddleware, async (req, res) => {

    const { boardId } = req.params;
    const { title, content } = req.body;

    const existsboard = await Boards.find({ boardId });
    if (!existsboard.length) {
        return res.status(400).json({ success: false, errorMessage: "찾는 게시물 없음." });
    }
    else {
        await Boards.updateOne({ boardId }, { $set: { content, title } });
        return res.json({ success: true });
    }
});
//글 삭제 , 댓글까지 같이 삭제
router.delete('/boards/:boardId', authMiddleware, async (req, res) => {
    const { boardId } = req.params;
    const user = res.locals.user;
    const [existBoard] = await Boards.find({ boardId: Number(boardId) });
    if (!existBoard) {
        return res.status(400).json({ success: false, errorMessage: '삭제할 데이터가 없습니다.' });
    };

    if (user.username !== existBoard.username) {
        return res.status(400).json({ success: false, errorMessage: '본인의 게시글만 삭제할 수 있습니다.' });
    };
    if (user.username === existBoard.username) {
        await Boards.deleteOne({ boardId: Number(boardId) });
        await Comment.deleteMany({ boardId: Number(boardId) });
        res.json({ successMessage: "성공적으로 삭제하였습니다." });
        return;
    }
});


module.exports = router;

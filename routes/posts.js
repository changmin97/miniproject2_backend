const express = require("express");
const Posts = require('../schemas/posts');
const Comment = require('../schemas/comments');
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();
const moment = require("moment");

//전체 조회
router.get('/posts', async (req, res) => {
    const posts = await posts
        .find({}, { postId: 1, product: 1, time: 1, content: 1 })
        .sort({ "time": -1 });
    res.json({ posts, });
});
//게시글 한개 조회
router.get('/posts/:postId', async (req, res) => {
    const { postId } = req.params;
    const existsposts = await posts
        .find({ postId }, { postId: 1, product: 1, content: 1, username: 1, time: 1, _id: 0 });
    if (!existsposts.length) {
        return res.status(400).json({ success: false, errorMessage: "찾는 게시물 없음." });
    }

    const existcomments = await Comment
        .find({ postId },
            { commentId: 1, product: 1, comment: 1, username: 1, time: 1, _id: 0 })
        .sort({ time: -1 });
    res.json({ existsposts, existcomments });
});

//글 작성
router.post("/posts", authMiddleware, async (req, res) => {
    const { username } = res.locals.user;
    const { postId, product, content } = req.body;
    const time = moment().add('9', 'h').format('YYYY-MM-DD HH:mm:ss')//표준시와의 시차적용한 시간

    const posts = await posts.find({ postId });
    if (posts.length) {
        return res.status(400).json({ success: false, errorMessage: "이미 있는 게시글입니다." })
    }

    const createdposts = await posts.create({ postId, username, product, content, time });
    res.json({ posts: createdposts });
});

//게시글 수정
router.put("/posts/:postId", authMiddleware, async (req, res) => {

    const { postId } = req.params;
    const { product, content } = req.body;

    const existspost = await posts.find({ postId });
    if (!existspost.length) {
        return res.status(400).json({ success: false, errorMessage: "찾는 게시물 없음." });
    }
    else {
        await posts.updateOne({ postId }, { $set: { content, product } });
        return res.json({ success: true });
    }
});
//글 삭제 , 댓글까지 같이 삭제
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const user = res.locals.user;
    const [existpost] = await posts.find({ postId: Number(postId) });
    if (!existpost) {
        return res.status(400).json({ success: false, errorMessage: '삭제할 데이터가 없습니다.' });
    };

    if (user.username !== existpost.username) {
        return res.status(400).json({ success: false, errorMessage: '본인의 게시글만 삭제할 수 있습니다.' });
    };
    if (user.username === existpost.username) {
        await posts.deleteOne({ postId: Number(postId) });
        await Comment.deleteMany({ postId: Number(postId) });
        res.json({ successMessage: "성공적으로 삭제하였습니다." });
        return;
    }
});


module.exports = router;

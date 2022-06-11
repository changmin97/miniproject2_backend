const express = require("express");
const User = require("../schemas/user");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const router = express.Router();

//회원가입 조건
const postUserSchema = Joi.object({
  ID: Joi.string().alphanum().min(4).max(12).required(),
  nickname: Joi.string().alphanum().min(2).max(12).required(),
  password: Joi.string().min(4).required(),
  passwordCheck: Joi.string().required(),
});
//회원가입
router.post("/signup", async (req, res) => {
  try {
    const { ID, nickname, password, passwordCheck } =
      await postUserSchema.validateAsync(req.body);

    if (password !== passwordCheck) {
      res.status(400).send({
        errorMessage: "패스워드가 패스워드 확인란과 동일하지 않습니다.",
      });
      return;
    } else if (password.includes(ID)) {
      res.status(400).send({
        errorMessage: "패스워드에 아이디가 포함되어있습니다.",
      });
      return;
    }
    const existID = await User.find({ ID });
    if (existID.length) {
      res.status(400).send({
        errorMessage: "중복된 아이디입니다.",
      });
      return;
    }

    const existnickname = await User.find({ nickname });
    if (existnickname.length) {
      res.status(400).send({
        errorMessage: "중복된 닉네임입니다.",
      });
      return;
    }

    const user = new User({ ID, nickname, password });
    await user.save();

    res.status(201).send({});
  } catch (err) {
    console.log(err);
    res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }
});

//로그인 조건 스키마
const postAuthSchema = Joi.object({
  ID: Joi.string().required(),
  password: Joi.string().required(),
});

router.post("/login", async (req, res) => {
  try {
    const { ID, password } = await postAuthSchema.validateAsync(req.body);
    const user = await User.findOne({ ID, password }).exec();

    if (!user) {
      res.status(400).send({
        errorMessage: "ID 또는 패스워드가 잘못됐습니다.",
      });
      return;
    }

    const token = jwt.sign({ nickname }, "my-secret-key");
    console.log(`${nickname}님이 로그인 하셨습니다.`);
    res.send({
      result: true,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      result: false,
    });
  }
});

// router.get("/User/me", authMiddleware, async (req, res) => {
//   const user = res.locals.user;
//   // user변수에 locals에있는 객체안에있는 키가 구조분해할당이 되어 들어간다
//   // 여기에 사용자 정보가 들어있다  인증용도
//   if (user) {
//     res.status(400).send({
//       errorMessage: "이미 로그인 되어있습니다.",
//     });
//     return;
//   }
// });

module.exports = router;

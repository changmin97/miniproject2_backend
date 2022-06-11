const express = require("express");
const connect = require("./schemas");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
connect();

//라우터
const postsRouter = require("./routes/posts");
const usersRouter = require("./routes/users");
const commentsRouter = require("./routes/comments");

mongoose.connect(
  "mongodb+srv://test:sparta@cluster0.7o347.mongodb.net/blog?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

//미들웨어
app.use(express.json());
app.use(
  "/",
  express.urlencoded({ extended: false }),
  [postsRouter],
  [usersRouter],
  [commentsRouter]
);

app.listen(port, () => {
  console.log("포트로 서버 ON!");
});

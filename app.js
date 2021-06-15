const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);

// 记录所有已经登录过的用户
const users = [];

server.listen(3000, () => {
  console.log("服务器启动成功，端口号：3000");
});

app.use(require("express").static("public"));
// app.use('/',function(req, res, next) {
//     next()
// })

app.get("/", function (req, res, next) {
  // res.redirect('/index.html')
});

io.on("connection", function (socket) {
  console.log("socket连接成功");
  socket.on("login", (data) => {
    const user = users.find((item) => item.username === data.username);
    if (user) {
      socket.emit("loginError", { msg: "登录失败" });
    } else {
      users.push(data);
      socket.emit("loginSuccess", data);
      io.emit("addUser", data);
      io.emit("userList", users);
      socket.username = data.username;
      socket.avatar = data.avatar;
    }
  });

  socket.on("disconnect", () => {
    let idx = users.findIndex((item) => item.username === socket.username);
    if (idx === -1) {
      return;
    }
    users.splice(idx, 1);
    io.emit("delUser", {
      username: socket.username,
      avatar: socket.avatar,
    });
    io.emit("userList", users);
  });

  socket.on("sendMessage", (data) => {
    io.emit("receiveMessage", data);
  });

  socket.on("sendImage", (data) => {
    io.emit("receiveImage", data);
  });
});

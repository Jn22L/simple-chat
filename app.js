const http = require("http");
const express = require("express");
const socket = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.use("/css", express.static("./static/css"));
app.use("/js", express.static("./static/js"));

app.get("/", function (request, response) {
  fs.readFile("./static/index.html", function (err, data) {
    if (err) {
      response.send("에러");
    } else {
      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(data);
      response.end();
    }
  });
});

io.sockets.on("connection", function (socket) {
  socket.on("newUser", function (name) {
    console.log(name + " 님이 접속하였습니다.");
    socket.name = name;
    io.sockets.emit("update", { type: "connect", name: "SERVER", message: name + "님이 접속하였습니다." });
  });

  socket.on("message", function (data) {
    data.name = socket.name;
    console.log(data);
    //socket.broadcast.emit("update", data); // 자신을 제외한 나머지 socket에게 emit
    io.sockets.emit("update", data); // 모든 socket 에게 emit
  });

  socket.on("disconnect", function () {
    console.log(socket.name + "님이 나가셨습니다.");
    socket.broadcast.emit("update", { type: "disconnect", name: "SERVER", message: socket.name + "님이 나가셨습니다." });
  });
});

server.listen(8080, function () {
  console.log("서버 실행 중..");
});

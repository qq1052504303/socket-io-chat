const socket = io.connect("http://localhost:3000");
let username, avatar;

$("#login_avatar li").on("click", function () {
  $(this).addClass("now").siblings().removeClass("now");
});

// 登录按钮
$("#loginBtn").on("click", function () {
  const username = $("#username").val()?.trim();
  if (!username) {
    alert("请输入用户名");
    return;
  }

  const avatar = $("#login_avatar li.now img")?.attr?.("src");
  if (!avatar) {
    alert("请选择头像");
    return;
  }
  socket.emit("login", {
    username: username,
    avatar: avatar,
  });
});
socket.on("loginError", (data) => {
  alert("用户已登录");
});

socket.on("loginSuccess", (data) => {
  $(".login_box").fadeOut();
  $(".container").fadeIn();
  $(".avatar_url").attr("src", data.avatar);
  $(".user-list .username").text(data.username);
  username = data.username;
  avatar = data.avatar;
});

socket.on("addUser", (data) => {
  $(".box-bd").append(`
    <div class="system">
      <p class="message_system">
        <span class="content">${data.username}加入了群聊</span>
      </p>
    </div>
  `);

  scrollIntoView();
});

socket.on("userList", (data) => {
  $(".user-list ul").html("");
  data.forEach((item) => {
    $(".user-list ul").append(`
      <li class="user">
        <div class="avatar"><img src="${item.avatar}" alt="" /></div>
        <div class="name">${item.username}</div>
      </li>      
    `);
  });

  $("#userCount").text(data.length);
});

socket.on("delUser", (data) => {
  $(".box-bd").append(`
    <div class="system">
      <p class="message_system">
        <span class="content">${data.username}离开了群聊</span>
      </p>
    </div>
  `);
  scrollIntoView();
});

$(".btn-send").on("click", () => {
  var content = $("#content").html();
  $("#content").html("");
  if (!content) return alert("请输入内容");
  socket.emit("sendMessage", {
    msg: content,
    username: username,
    avatar: avatar,
  });
});

socket.on("receiveMessage", (data) => {
  if (data.username === username) {
    $(".box-bd").append(`
      <div class="message-box">
        <div class="my message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">${data.msg}</div>
            </div>
          </div>
        </div>
      </div>
    `);
  } else {
    $(".box-bd").append(`
      <div class="message-box">
        <div class="other message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="nickname">${data.username}</div>
            <div class="bubble">
              <div class="bubble_cont">${data.msg}</div>
            </div>
          </div>
        </div>
      </div>
    `);
  }
  scrollIntoView();
});

function scrollIntoView() {
  $(".box-bd").children(":last").get(0).scrollIntoView(false);
}

socket.on("receiveImage", (data) => {
  if (data.username === username) {
    $(".box-bd").append(`
      <div class="message-box">
        <div class="my message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">
                <img src="${data.img}">
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
  } else {
    $(".box-bd").append(`
      <div class="message-box">
        <div class="other message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="nickname">${data.username}</div>
            <div class="bubble">
              <div class="bubble_cont">
                <img src="${data.img}">
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
  }
  $(".box-bd img:last").on("load", function () {
    scrollIntoView();
  });
});

$("#file").on("change", function () {
  const file = this.files[0];
  const that = this;
  const fr = new FileReader();
  fr.readAsDataURL(file);
  fr.onload = function () {
    socket.emit("sendImage", {
      username: username,
      avatar: avatar,
      img: fr.result,
    });
  };
});

$(".face").on("click", function () {
  $("#content").emoji({
    button: ".face",
    animation: 'slide',
    position: 'topRight',
    icons: [
      {
        name: "QQ表情",
        path: "../lib/jquery-emoji/img/qq/",
        maxNum: 91,
        excludeNums: [41, 45, 54],
        file: ".gif",
        placeholder: "#qq_{alias}#",
      },
    ],
  });
});

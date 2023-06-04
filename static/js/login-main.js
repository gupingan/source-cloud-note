// 获取相关元素
const $h2Tag = $("h2:first");
const $unameInput = $("#username");
const $upwdInput = $("#password");
const $toRegisterButton = $("#to-register-button");
const $loginButton = $("#login-button");

// 配置
mainParams = {
    're_home': null,
    'register': null,
    'call_login': null,
};

// 前往注册按钮点击事件
$toRegisterButton.on("click", function () {
  window.location.assign(mainParams['register']);
});

// 登录按钮点击事件
$loginButton.on("click", function () {
  if ($upwdInput.val()) {
    if (targetData["current-width"]) {
      fetch(mainParams['call_login'], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').val(),
        },
        body: JSON.stringify({
          uname: $unameInput.val(),
          upwd: $upwdInput.val(),
          captcha: targetData["current-width"],
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.status === "ok") {
            window.location.assign(
              mainParams['re_home'] + result.message + "/"
            );
          } else if (result.status === "error") {
            showPopup(result.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      showPopup("验证码未验证");
    }
  } else {
    showPopup("密码未输入");
  }
});

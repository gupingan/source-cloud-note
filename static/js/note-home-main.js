noteHomeParams = {
  call_logout: null,
  login: null,
};

// 获取头像、用户名和下拉菜单元素
const $userAvatar = $(".user-avatar");
const $username = $(".username");
const $userInfo = $(".user-info");
const $dropdownMenu = $(".dropdown-menu");

// 点击或触摸头像和用户名时显示下拉菜单
$userInfo.on("click", toggleDropdownMenu);
$userInfo.on("mousemove", openDropdownMenu);
$(".dropdown-menu").on("mouseleave", closeDropdownMenu);
$(".content").on("click", closeDropdownMenu);
$("#particles").on("click", closeDropdownMenu);
$(document).on("click", closeDropdownMenu);

// 切换下拉菜单的显示状态
function toggleDropdownMenu() {
  $dropdownMenu.toggle();
}
function closeDropdownMenu() {
  $dropdownMenu.hide();
}
function openDropdownMenu() {
  $dropdownMenu.show();
}

$(".dropdown-menu-item:eq(1)").on("click", function () {
  $.ajax({
    url: noteHomeParams.call_logout,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').val(),
    },
  })
    .done(function (result) {
      console.log(result);
      if (result.status === "ok") {
        window.location.assign(noteHomeParams.login);
      } else if (result.status === "error") {
        let errorMessage = result.message;
        if (errorMessage == "用户已退出登录") {
          window.location.assign(noteHomeParams.login);
        }
        showPopup(errorMessage);
      }
    })
    .fail(function (error) {
      console.error("Error:", error);
    });
});

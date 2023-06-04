/***
 * 外部输入框 变量名应为$unameInput,用于接收用户名
 *
 */
const $captchaSlider = $("#captcha-slider");
const $targetSlider = $("#target-slider");
const $captchaContainer = $("#captcha-container");
const $captchaButtion = $("#captcha-button");
const $verificationSuccess = $("#verification-success");
// post提交的数据（最大偏移距离，用户名）
var data = {
  "max-offset-width": $captchaContainer.width() - $targetSlider.width(),
  "uname": null,
};

// 执行数据（目标偏移数据、当前获取数据）
var targetData = {
  "offset-width": null,
  "current-width": null,
};

var params = {
  "api-url": "",
};

function setSliderParams(apiUrl) {
  params["api-url"] = apiUrl;
}

function setPostData(key, value) {
  data[key] = value;
}

// 获取验证码单击事件
$captchaButtion.on("click", function () {
  setPostData(
    "max-offset-width",
    $captchaContainer.width() - $targetSlider.width()
  );
  setPostData("uname", $unameInput.val());

  $.ajax({
    url: params["api-url"],
    type: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": $("input[name='csrfmiddlewaretoken']").val(),
    },
    data: JSON.stringify(data),
    success: function (result) {
      if (result.status === "ok") {
        // 返回正确执行
        targetData["offset-width"] = result.data["offset-width"];
        $targetSlider.css(
          "transform",
          `translateX(${targetData["offset-width"]}px)`
        );
        $captchaButtion.css("opacity", 0);
        setTimeout(() => {
          $captchaButtion.css("z-index", -2);
        }, 500);
      } else if (result.status === "error") {
        // 返回错误执行
        showPopup(result.message);
      }
    },
    error: function (error) {
      console.error("Error:", error);
    }
  });
});

// 获取滑块初始信息
let isDragging = false;
let initialX = 0;

// 监听滑块鼠标按下事件
$captchaSlider.on("mousedown", function (e) {
  isDragging = true;
  initialX = e.clientX;
});

// 监听滑块鼠标移动事件
$(document).on("mousemove", function (e) {
  if (isDragging) {
    const offsetX = e.clientX - initialX;
    const captchaWidth =
      $captchaContainer.width() - $captchaSlider.width();
    let newPosition = Math.max(0, Math.min(offsetX, captchaWidth));
    $captchaSlider.css("transform", `translateX(${newPosition}px)`);
  }
});

// 监听滑块鼠标释放事件
$(document).on("mouseup", function () {
  if (isDragging) {
    isDragging = false;
    const captchaWidth =
      $captchaContainer.width() - $captchaSlider.width();
      const sliderPosition = parseInt(
        $captchaSlider.css("transform")
          .replace(/[^0-9\-.,]/g, '')
          .split(',')[4]
      );
      
    // 验证滑块是否达到指定位置
    console.log(sliderPosition);
    if (
      sliderPosition >= targetData["offset-width"] - 10 &&
      sliderPosition <= targetData["offset-width"] + 10
    ) {
      // 验证通过，执行相应操作
      $captchaSlider.css("pointer-events", "none");
      $verificationSuccess.css("opacity", 1);
      $verificationSuccess.css("z-index", 9999);
      targetData["current-width"] = sliderPosition;
    } else {
      // 验证失败，重置滑块位置
      $captchaSlider.css("transform", "translateX(0)");
    }
  }
});

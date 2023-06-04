var operateParams = {
  noteHomeUrl: "",
  folderId: "",
  createFolderUrl: "",
  createNoteUrl: "",
  deleteUrl: "",
  renameUrl: "",
  reHomeUrl: "",
  parentFolderId: "",
};

function openPopup(id) {
  $(id).css("display", "block");
}

function closePopup(id) {
  $(id).css("display", "none");
  $("#rename-error-message").text("");
  $("#create-error-message").text("");
}

function postAPI(url, data) {
  $.ajax({
    url: url,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').val(),
    },
    data: JSON.stringify(data),
  })
    .done(function (result) {
      console.log(result);
      if (result.status === "ok") {
        window.location.assign(operateParams.noteHomeUrl);
      } else if (result.status === "error") {
        let errorMessage = result.message;
        showPopup(errorMessage);
      }
    })
    .fail(function (error) {
      console.error("Error:", error);
    });
}

function createItem() {
  var fileName = $("#popupInput").val();
  var fileType = $("#popupSelect:first").val();
  if (fileName) {
    if (fileType === "folder") {
      var data = {
        "parent-folder-id": operateParams.folderId,
        "folder-name": fileName,
      };
      postAPI(operateParams.createFolderUrl, data);
    } else if (fileType === "markdown") {
      var data = {
        "folder-id": operateParams.folderId,
        "file-name": fileName + ".md",
      };
      postAPI(operateParams.createNoteUrl, data);
    }
    closePopup("#createPopup");
  } else {
    $("#create-error-message").text("文件名不能为空");
  }
}

$(document).ready(function () {
  let contextMenu; // 声明一个变量来存储右键菜单

  // 添加右击事件监听器
  function addContextMenu() {
    $(".folder").on("contextmenu", function (event) {
      event.preventDefault(); // 阻止默认右击菜单的显示

      const folder = $(this);
      const noteId = folder.data("note-id");
      const folderId = folder.data("folder-id");

      // 隐藏其他右键菜单（如果存在）
      hideContextMenu();

      // 创建并显示当前右键菜单
      contextMenu = $('<div class="context-menu">')
        .css({
          left: event.clientX,
          top: event.clientY,
        })
        .appendTo("body");

      // 添加菜单项并绑定点击事件
      $('<div class="context-menu-item">删除</div>')
        .appendTo(contextMenu)
        .on("click", function () {
          // 调用删除文件夹或笔记的函数，根据是否有 noteId 或 folderId 判断是删除文件夹还是笔记
          if (noteId) {
            deleteItem(noteId, "other");
          } else if (folderId) {
            deleteItem(folderId, "folder");
          }
          hideContextMenu();
        });

      $('<div class="context-menu-item">重命名</div>')
        .appendTo(contextMenu)
        .on("click", function () {
          // 调用重命名文件夹或笔记的函数，根据是否有 noteId 或 folderId 判断是重命名文件夹还是笔记
          if (noteId) {
            renameItem(noteId, "other");
          } else if (folderId) {
            renameItem(folderId, "folder");
          }
          hideContextMenu();
        });

      // 点击其他地方时隐藏右键菜单
      $(document).on("click", hideContextMenu);
    });
  }

  // 隐藏右键菜单
  function hideContextMenu() {
    if (contextMenu) {
      contextMenu.remove();
      contextMenu = null;
      $(document).off("click", hideContextMenu);
    }
  }

  // 删除文件夹或笔记的函数
  function deleteItem(itemId, itemType) {
    const data = {
      id: itemId,
      type: itemType,
    };
    postAPI(operateParams.deleteUrl, data);
  }

  // 重命名文件夹或笔记的函数
  function renameItem(itemId, itemType) {
    $("#rename-ok").on("click", function () {
      const newName = $("#popup-rename-input").val();
      if (newName) {
        const data = {
          id: itemId,
          type: itemType,
          "new-name": newName,
        };
        if (itemType === "other" &&  $("#popup-rename-select").val() !== "folder") {
          switch ($("#popup-rename-select").val()) {
            case "markdown":
              data["new-name"] += ".md";
              break;
            default:
              break;
          }
          postAPI(operateParams.renameUrl, data);
          closePopup("#renamePopup");
        } else {
          $("#rename-error-message").text("不能将文件转为文件夹");
        }
        if (itemType === "folder" && $("#popup-rename-select").val() === "folder") {
          postAPI(operateParams.renameUrl, data);
          closePopup("#renamePopup");
        } else {
          $("#rename-error-message").text("不能将文件夹转为文件");
        }
      } else {
        if (itemType === "folder") {
          $("#rename-error-message").text("文件夹名不能为空");
        } else {
          $("#rename-error-message").text("文件名不能为空");
        }
      }
    });
    if (itemType === "folder") {
      $("#popup-rename-select").html(`<option value="folder">文件夹</option>`);
    }
    openPopup("#renamePopup");
  }

  addContextMenu();
});

const $topButtons = $(".top-button");
$topButtons.each(function (index, btn) {
  switch (index) {
    case 0: // 返回上一级
      $(btn).on("click", function () {
        parent_folder_id = operateParams.parentFolderId;
        if (parent_folder_id != "") {
          var url = operateParams.reHomeUrl + parent_folder_id + "/";
          window.location.href = url;
        } else {
          showPopup("已经位于根目录");
        }
      });
      break;
    case 1: // 添加
      $(btn).on("click", function () {
        openPopup("#createPopup");
      });
      break;
    default:
      break;
  }
});

$(".folder").dblclick(function () {
  if ($(this).data("folder-id")) {
    var itemId = $(this).data("folder-id");
    var url = operateParams.reHomeUrl + itemId + "/";
    window.location.href = url;
  } else if ($(this).data("note-id")) {
    var itemId = $(this).data("note-id");
    var url =
      operateParams.reHomeUrl +
      operateParams.folderId +
      "/md/" +
      itemId +
      "/";
    window.location.href = url;
  }
});

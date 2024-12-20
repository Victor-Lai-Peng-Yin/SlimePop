window.addEventListener("load", function () {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("ServiceWorker.js");
  }
});

var unityInstanceRef;
var unsubscribe;
var container = document.querySelector("#unity-container");
var canvas = document.querySelector("#unity-canvas");
var loadingBar = document.querySelector("#unity-loading-bar");
var progressBarFull = document.querySelector("#unity-progress-bar-full");
var warningBanner = document.querySelector("#unity-warning");

function unityShowBanner(msg, type) {
function updateBannerVisibility() {
  warningBanner.style.display = warningBanner.children.length ? 'block' : 'none';
}
var div = document.createElement('div');
div.innerHTML = msg;
warningBanner.appendChild(div);
if (type == 'error') div.style = 'background: red; padding: 10px;';
else {
  if (type == 'warning') div.style = 'background: yellow; padding: 10px;';
  setTimeout(function() {
    warningBanner.removeChild(div);
    updateBannerVisibility();
  }, 5000);
}
updateBannerVisibility();
}

var buildUrl = "Build";
var loaderUrl = buildUrl + "/Build.loader.js";
var config = {
dataUrl: buildUrl + "/Build.data.unityweb",
frameworkUrl: buildUrl + "/Build.framework.js.unityweb",
codeUrl: buildUrl + "/Build.wasm.unityweb",
streamingAssetsUrl: "StreamingAssets",
companyName: "DefaultCompany",
productName: "Unityproject",
productVersion: "1.0",
showBanner: unityShowBanner,
};


if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
var meta = document.createElement('meta');
meta.name = 'viewport';
meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
document.getElementsByTagName('head')[0].appendChild(meta);
}

loadingBar.style.display = "block";


var script = document.createElement("script");
script.src = loaderUrl;
script.onload = () => {
createUnityInstance(canvas, config, (progress) => {
  progressBarFull.style.width = 100 * progress + "%";
}).then((unityInstance) => {
  unityInstanceRef = unityInstance;
  loadingBar.style.display = "none";

  Telegram.WebApp.ready();
  var initData = Telegram.WebApp.initData;
  var initDataUnsafe = Telegram.WebApp.initDataUnsafe;
  console.log("initData is " + initData);
  SendAuthDataToUnity(initData);
  
}).catch((message) => {
  alert(message);
});
};
document.body.appendChild(script);

function openInvoiceInTelegram(invoiceLink) {
  window.Telegram.WebApp.openInvoice(invoiceLink, function(status) {
      if (status === "paid") {
          console.log("Payment was successful!");
          SendMessage("JsonObject", "OnPaymentSuccess", "Payment was successful");
      } else {
          console.log("Payment failed or canceled.");
      }
  });
}

function SendAuthDataToUnity(initData) {
  if (unityInstanceRef) {
    // 解析 initData 中的參數
    var urlParams = new URLSearchParams(initData);

    // 獲取 start_param 的值
    var startParamValue = urlParams.get('start_param');
    console.log("start_param value: ", startParamValue);

    // 解析 user 數據（如果存在）
    var userDataJson = urlParams.get('user');
    console.log("User data JSON string: ", userDataJson);

    // 傳遞數據到 Unity
    unityInstanceRef.SendMessage('JsonObject', 'ReceiveInitData', initData);
    if (userDataJson) {
      unityInstanceRef.SendMessage('JsonObject', 'ReceiveInitData2', userDataJson);
    }
    if (startParamValue) {
      unityInstanceRef.SendMessage('JsonObject', 'ReceiveStartAppValue', startParamValue);
    }

    // 獲取用戶圖片 URL 並傳遞到 Unity（如果存在）
    if (userDataJson) {
      var userData = JSON.parse(decodeURIComponent(userDataJson));
      if (userData.photo_url) {
        unityInstanceRef.SendMessage('JsonObject', 'ReceiveUserPhoto', userData.photo_url);
      }
    }
  } else {
    console.error("Unity instance not ready");
  }
}

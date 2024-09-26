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

// 手機設備設定
if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
  var meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
  document.getElementsByTagName('head')[0].appendChild(meta);
}

loadingBar.style.display = "block";

// 加載 Unity WebGL 並初始化 Telegram
var script = document.createElement("script");
script.src = loaderUrl;
script.onload = () => {
  createUnityInstance(canvas, config, (progress) => {
    progressBarFull.style.width = 100 * progress + "%";
  }).then((unityInstance) => {
    unityInstanceRef = unityInstance;
    loadingBar.style.display = "none";

    // 當 Unity 加載完成後，將 Telegram 的 initData 傳給 Unity
    Telegram.WebApp.ready();
    var initData = Telegram.WebApp.initData;
    console.log("initData is " + initData);
    
    // 在這裡解析 initData 並傳遞給 Unity
    SendAuthDataToUnity(initData);
    
  }).catch((message) => {
    alert(message);
  });
};
document.body.appendChild(script);

// 解析 initData 並傳遞給 Unity 的函數
function SendAuthDataToUnity(initData) {
  if (unityInstanceRef) {
    // 解析 initData 並提取 user 信息
    var urlParams = new URLSearchParams(initData);
    var userData = JSON.parse(urlParams.get('user'));

    // 將提取的 userData 轉換為 JSON 字符串
    var userDataJson = JSON.stringify(userData);

    // 在這裡打印出解析後的 userData 和 userDataJson
    console.log("Parsed user data: ", userData);
    console.log("User data JSON string: ", userDataJson);

    // 傳遞數據給 Unity C# 的 ReceiveInitData 函數
    unityInstanceRef.SendMessage('JsonObject', 'ReceiveInitData', userDataJson);
  } else {
    console.error("Unity instance not ready");
  }
}





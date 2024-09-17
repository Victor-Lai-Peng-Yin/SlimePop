window.addEventListener("load", function () {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("ServiceWorker.js");
  }
});

var unityInstanceRef;
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

    // 在 Unity 實例初始化後，從 Telegram Web App 獲取 initData
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready(function () {
        let initData = window.Telegram.WebApp.initData;
        sendInitDataToUnity(initData);
      });
    }
  }).catch((message) => {
    alert(message);
  });
};
document.body.appendChild(script);

function sendInitDataToUnity(initData) {
  if (unityInstanceRef) {
    unityInstanceRef.SendMessage('GameManager', 'ReceiveInitData', initData);
  } else {
    console.error("Unity instance is not initialized yet.");
  }
}

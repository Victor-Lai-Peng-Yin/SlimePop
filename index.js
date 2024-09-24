window.onload = function () {
  Telegram.WebApp.ready();
  var initData = Telegram.WebApp.initData;

  // Unity 加載邏輯
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

  var canvas = document.querySelector("#unity-canvas");
  var loadingBar = document.querySelector("#unity-loading-bar");
  var progressBarFull = document.querySelector("#unity-progress-bar-full");

  loadingBar.style.display = "block";

  var script = document.createElement("script");
  script.src = loaderUrl;
  script.onload = () => {
    createUnityInstance(canvas, config, (progress) => {
      progressBarFull.style.width = 100 * progress + "%";
    }).then((unityInstance) => {
      unityInstanceRef = unityInstance;
      loadingBar.style.display = "none";

      // Unity 加載完成後，將 Telegram 的 initData 傳遞給 Unity
      unityInstance.SendMessage('JsonExample', 'ReceiveInitData', initData);

    }).catch((message) => {
      alert(message);
    });
  };
  document.body.appendChild(script);
};

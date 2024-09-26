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
  SendAuthDataToUnity(initData);
  
}).catch((message) => {
  alert(message);
});
};
document.body.appendChild(script);

function SendAuthDataToUnity(initData) {
  if (unityInstanceRef) {
    var urlParams = new URLSearchParams(initData);
    var userData = JSON.parse(urlParams.get('user'));

    var userDataJson = JSON.stringify(userData);

    console.log("Parsed user data: ", userData);
    console.log("User data JSON string: ", userDataJson);

    unityInstanceRef.SendMessage('JsonObject', 'ReceiveInitData', initData);
    unityInstanceRef.SendMessage('JsonObject', 'ReceiveInitData2', userDataJson);

    // 使用 Telegram API 來獲取頭像
    const userId = userData.id; 
    const botToken = '7301235139:AAGj60uaZRZvVxpg2Esc2A_QsDrPpsw27D0'; 
    const url = `https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${userId}&limit=1`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.ok && data.result.photos.length > 0) {
          const fileId = data.result.photos[0][0].file_id;
          getFileUrl(fileId);
        } else {
          console.log('No profile photos found.');
        }
      })
      .catch(error => console.error('Error fetching user profile photos:', error));
  } else {
    console.error("Unity instance not ready");
  }
}

function getFileUrl(fileId) {
  const botToken = '7301235139:AAGj60uaZRZvVxpg2Esc2A_QsDrPpsw27D0'; 
  const getFileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
  
  fetch(getFileUrl)
    .then(response => response.json())
    .then(data => {
      if (data.ok) {
        const filePath = data.result.file_path;
        const profilePicUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
        console.log('Profile picture URL:', profilePicUrl);

        // 傳遞頭像 URL 給 Unity
        unityInstanceRef.SendMessage('JsonObject', 'ReceiveProfilePictureUrl', profilePicUrl);
      } else {
        console.log('Failed to get file URL.');
      }
    })
    .catch(error => console.error('Error fetching file URL:', error));
}





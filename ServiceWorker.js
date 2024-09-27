const cacheName = "DefaultCompany-Unityproject-1.1"; // 每次發布新版本時更新這個版本號
const contentToCache = [
    "Build/Build.loader.js",
    "Build/Build.framework.js.unityweb",
    "Build/Build.data.unityweb",
    "Build/Build.wasm.unityweb",
    "TemplateData/style.css"
];

// 安裝階段 - 緩存指定的資源
self.addEventListener('install', function (e) {
    console.log('[Service Worker] Installing new version...');
    
    e.waitUntil((async function () {
        const cache = await caches.open(cacheName);
        console.log('[Service Worker] Caching app shell and content');
        await cache.addAll(contentToCache);
    })());

    // 強制跳過等待，立即啟用新版本
    self.skipWaiting();
});

// 激活階段 - 清理舊的緩存
self.addEventListener('activate', function (e) {
    console.log('[Service Worker] Activating new version...');
    
    e.waitUntil((async function () {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(async (name) => {
                if (name !== cacheName) {
                    console.log(`[Service Worker] Deleting old cache: ${name}`);
                    return await caches.delete(name);
                }
            })
        );
    })());

    // 立即取得控制權，讓新的 Service Worker 生效
    return self.clients.claim();
});

// 攔截網絡請求並提供緩存或從網絡獲取最新資源
self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
        const cache = await caches.open(cacheName);
        
        try {
            // 嘗試從緩存中匹配請求
            let response = await caches.match(e.request);
            if (response) {
                console.log(`[Service Worker] Serving from cache: ${e.request.url}`);
                return response;
            }

            // 如果不在緩存中，從網絡獲取並更新緩存
            response = await fetch(e.request);
            cache.put(e.request, response.clone());
            console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
            return response;
        } catch (error) {
            console.log(`[Service Worker] Fetch failed; returning offline page instead.`);
            // 當網絡請求失敗時可以考慮返回一個離線頁面
            return new Response('You are offline.');
        }
    })());
});

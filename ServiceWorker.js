const cacheName = "DefaultCompany-Unityproject-1.1"; // 每次发布新版本时更新这个版本号
const contentToCache = [
    "Build/Build.loader.js",
    "Build/Build.framework.js.unityweb",
    "Build/Build.data.unityweb",
    "Build/Build.wasm.unityweb",
    "TemplateData/style.css"
];

// 安装阶段 - 缓存指定的资源
self.addEventListener('install', function (e) {
    console.log('[Service Worker] Installing new version...');
    
    e.waitUntil((async function () {
        const cache = await caches.open(cacheName);
        console.log('[Service Worker] Caching app shell and content');
        await cache.addAll(contentToCache);
    })());

    // 强制跳过等待，立即启用新版本
    self.skipWaiting();
});

// 激活阶段 - 清理旧的缓存
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

    // 立即取得控制权，让新的 Service Worker 生效
    return self.clients.claim();
});

// 拦截网络请求并提供缓存或从网络获取最新资源
self.addEventListener('fetch', function (e) {
    // 只缓存 GET 请求，跳过 POST 请求
    if (e.request.method !== 'GET') {
        return;
    }

    e.respondWith((async function () {
        const cache = await caches.open(cacheName);
        
        try {
            // 尝试从缓存中匹配请求
            let response = await caches.match(e.request);
            if (response) {
                console.log(`[Service Worker] Serving from cache: ${e.request.url}`);
                return response;
            }

            // 如果不在缓存中，从网络获取并更新缓存
            response = await fetch(e.request);
            cache.put(e.request, response.clone());
            console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
            return response;
        } catch (error) {
            console.log(`[Service Worker] Fetch failed; returning offline page instead.`);
            // 当网络请求失败时可以考虑返回一个离线页面
            return new Response('You are offline.');
        }
    })());
});


'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "favicon.png": "dcacf472e39fe24ae265d9dffaba52aa",
"assets/assets/images/reogapps.png": "d7e450e0184f6a907579e8f0fcb92e80",
"assets/assets/images/github.png": "5edd44d445bac87e932382811756b900",
"assets/assets/images/coworking.png": "aaf594f7523b7654d34a8e5ec2352543",
"assets/assets/images/reogwallpaper.png": "a10d867c40a353ae97b1a2befc2abd00",
"assets/assets/images/email.png": "de9310dd74a7b178bac4f3d4e682dfce",
"assets/assets/images/photo.png": "ef41bf430621b23644a72fb3f9cbc53c",
"assets/assets/images/linkedin.png": "d0b91e639d2a1239846780788f524e27",
"assets/assets/images/logo.png": "bdd028964cd86fca41bfe97b3e64e5b1",
"assets/assets/images/illustration.png": "8cb97950ddb06a485d7fa95773322b5a",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/NOTICES": "3734ac1101b6cee70951cc34bfbc3e5e",
"assets/google_fonts/Roboto-Thin.ttf": "321de678e592d0b8f44f1a82d7ca4b62",
"assets/google_fonts/Roboto-LightItalic.ttf": "a3ce4440f2abf76f4a1b14b83920138c",
"assets/google_fonts/Roboto-Regular.ttf": "11eabca2251325cfc5589c9c6fb57b46",
"assets/google_fonts/Roboto-ThinItalic.ttf": "35a9c89aff1396595ad345e378a32aca",
"assets/google_fonts/Roboto-Italic.ttf": "a720f17aa773e493a7ebf8b08459e66c",
"assets/google_fonts/Roboto-BlackItalic.ttf": "99682a78fa4fe61e1177b94757336bbf",
"assets/google_fonts/Roboto-MediumItalic.ttf": "cf23e1bb619029496260760b72aebd30",
"assets/google_fonts/Roboto-Light.ttf": "88823c2015ffd5fa89d567e17297a137",
"assets/google_fonts/Roboto-BoldItalic.ttf": "5b44818d2b9eda3e23cd5edd7b49b7d5",
"assets/google_fonts/Roboto-Medium.ttf": "58aef543c97bbaf6a9896e8484456d98",
"assets/google_fonts/Roboto-Black.ttf": "5ebb24ee1112dd9562629375c387879a",
"assets/google_fonts/LICENSE.txt": "d273d63619c9aeaf15cdaf76422c4f87",
"assets/google_fonts/Roboto-Bold.ttf": "e07df86cef2e721115583d61d1fb68a6",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/AssetManifest.json": "6b283a50dd14ef8d7f7c7822781beafe",
"main.dart.js": "f415ae8fa484c5a614876e0445030bd1",
"version.json": "f9c219717095f17be56fe66cf3e1af3e",
"index.html": "a93d8970425cefe54bd38e856f5ae1d6",
"/": "a93d8970425cefe54bd38e856f5ae1d6",
"manifest.json": "39a29d297a2b6560dd47d2b55225d817",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}

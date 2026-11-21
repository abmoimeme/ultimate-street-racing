// Ultimate Street Racing service worker: fast reloads and an installable app.
const V='usr-4.0';
const CORE=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
const CDN=/^https:\/\/(cdnjs\.cloudflare\.com|www\.gstatic\.com\/firebasejs)\//;
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).catch(()=>{}).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const put=(req,res)=>{if(res&&res.ok&&(res.type==='basic'||res.type==='cors')){const c=res.clone();caches.open(V).then(x=>x.put(req,c)).catch(()=>{});}return res;};
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  const same=u.origin===location.origin;
  if(!same&&!CDN.test(r.url))return; // database and everything else go straight to the network
  if(r.mode==='navigate'||(same&&/\.html$|\/$/.test(u.pathname))){ // pages: newest first, saved copy if offline
    e.respondWith(fetch(r).then(res=>put(r,res)).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./index.html'))));return;}
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>put(r,res)))); // models, fonts, maps, libraries: saved copy first
});

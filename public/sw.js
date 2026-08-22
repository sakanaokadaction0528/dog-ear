// Dog Ear Service Worker — キャッシュ戦略で高速起動を実現
const STATIC_CACHE = 'dog-ear-static-v1'
const ASSET_CACHE  = 'dog-ear-assets-v1'

// インストール時：即座にアクティブに
self.addEventListener('install', () => self.skipWaiting())

// アクティベート時：古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== ASSET_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // /_next/static/ → キャッシュファースト（ハッシュ付きファイル名で永続キャッシュ可能）
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((res) => {
          if (res.ok) {
            caches.open(STATIC_CACHE).then((c) => c.put(request, res.clone()))
          }
          return res
        })
      })
    )
    return
  }

  // 画像・アイコン・マニフェスト → キャッシュファースト
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|woff2?)$/) ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((res) => {
          if (res.ok) {
            caches.open(ASSET_CACHE).then((c) => c.put(request, res.clone()))
          }
          return res
        })
      })
    )
    return
  }

  // API・認証・外部リクエスト → ネットワークのみ（キャッシュしない）
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.origin !== self.location.origin
  ) {
    return // デフォルトのネットワークフェッチに任せる
  }

  // その他（HTMLページ）→ ネットワーク優先（オフライン時はキャッシュ）
  // ページはキャッシュせず常に最新を取得（SSR/リダイレクトが正しく動くように）
})

const CACHE_NAME = 'time-calculator-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Установка Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker устанавливается');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кэш открыт');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Ошибка кэширования:', err);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker активируется');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Удаляем старые кэши
          if (cacheName !== CACHE_NAME) {
            console.log('Удаляем старый кэш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Перехват запросов
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем кэшированную версию или делаем новый запрос
        if (response) {
          console.log('Найдено в кэше:', event.request.url);
          return response;
        }
        
        console.log('Загружаем из сети:', event.request.url);
        return fetch(event.request).then(response => {
          // Проверяем валидность ответа
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Клонируем ответ для кэша
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(err => {
        console.error('Ошибка fetch:', err);
        // Можем вернуть fallback страницу
        return new Response('Приложение недоступно офлайн', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      })
  );
});

// Обновление кэша
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push уведомления (опционально)
self.addEventListener('push', event => {
  const options = {
    body: 'Калькулятор времени готов к работе!',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0iIzY2N2VlYSI+PGNpcmNsZSBjeD0iNDgiIGN5PSI0OCIgcj0iNDQiIGZpbGw9IiM2NjdlZWEiLz48dGV4dCB4PSI0OCIgeT0iNTYiIGZpbGw9IiNmZmYiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlQ8L3RleHQ+PC9zdmc+',
    badge: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0iIzY2N2VlYSI+PGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjIiIGZpbGw9IiM2NjdlZWEiLz48L3N2Zz4=',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Калькулятор времени', options)
  );
});

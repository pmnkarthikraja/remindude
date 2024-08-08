// serviceWorkerRegistration.ts
const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.0/8 are considered localhost.
      window.location.hostname.match(
        /^127(?:\.\d+){0,2}\.\d+$/,
      )
  );
  
  export function register(config?: { onUpdate?: () => void; onSuccess?: () => void }) {
    if ('serviceWorker' in navigator) {
      const publicUrl = new URL(
        import.meta.url,
        window.location.href,
      );
      if (publicUrl.origin !== window.location.origin) {
        return;
      }
  
      window.addEventListener('load', () => {
        const swUrl = `${import.meta.url}service-worker.js`;
  
        if (isLocalhost) {
            if (!!config){
                checkValidServiceWorker(swUrl, config);
            }
        } else {
          registerValidSW(swUrl, config);
        }
      });
    }
  }
  
  function registerValidSW(swUrl: string, config?: { onUpdate?: () => void; onSuccess?: () => void }) {
    navigator.serviceWorker
      .register(swUrl)
      .then(registration => {
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log(
                    'New content is available; please refresh.',
                  );
  
                  if (config && config.onUpdate) {
                    config.onUpdate();
                  }
                } else {
                  console.log('Content is cached for offline use.');
  
                  if (config && config.onSuccess) {
                    config.onSuccess();
                  }
                }
              }
            };
          }
        };
      })
      .catch(error => {
        console.error('Error during service worker registration:', error);
      });
  }
  
  function checkValidServiceWorker(swUrl: string, config: { onUpdate?: () => void; onSuccess?: () => void }) {
    fetch(swUrl, {
      headers: { 'Service-Worker': 'script' },
    })
      .then(response => {
        // Ensure service worker exists, and that we really are getting a JS file.
        const contentType = response.headers.get('content-type');
        if (
          response.status === 404 ||
          (contentType && contentType.indexOf('javascript') === -1)
        ) {
          // No service worker found. Probably a different app. Unregistering.
          navigator.serviceWorker.ready.then(registration => {
            registration.unregister().then(() => {
              window.location.reload();
            });
          });
        } else {
          // Service worker found. Proceed as normal.
          registerValidSW(swUrl, config);
        }
      })
      .catch(() => {
        console.log(
          'No internet connection found. App is running in offline mode.',
        );
      });
  }
  
/**
 * Retro Vault - Legacy app.js forwarder
 * Redirects execution to the new dynamic engine: script.js
 */
(function() {
  if (typeof window !== 'undefined' && !window.__scriptJsLoaded) {
    window.__scriptJsLoaded = true;
    const script = document.createElement('script');
    script.src = 'script.js';
    document.body.appendChild(script);
  }
})();

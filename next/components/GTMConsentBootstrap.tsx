export default function GTMConsentBootstrap() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
(function () {
  if (typeof window === 'undefined') return;

  // Ensure dataLayer exists
  window.dataLayer = window.dataLayer || [];

  // Idempotent consent-default / init event
  if (!window.__gtmConsentInitialized) {
    window.__gtmConsentInitialized = true;
    window.dataLayer.push({
      event: 'gtm.init_consent',
      gtm: { uniqueEventId: Math.floor(Math.random() * 1e6) }
    });
  }

  // Attach Cookiebot listeners once
  if (!window.__gtmCookiebotListenersAttached) {
    window.__gtmCookiebotListenersAttached = true;

    function pushConsentUpdate() {
      if (!window.Cookiebot || !window.Cookiebot.consent) return;

      var c = window.Cookiebot.consent;
      window.dataLayer = window.dataLayer || [];

      window.dataLayer.push({
        event: 'consent_update',
        consent: {
          marketing: !!c.marketing,
          preferences: !!c.preferences,
          statistics: !!c.statistics,
          necessary: !!c.necessary
        }
      });

      if (c.marketing) {
        window.dataLayer.push({ event: 'CookiebotConsentGiven' });
      } else {
        window.dataLayer.push({ event: 'CookiebotConsentDenied' });
      }
    }

    document.addEventListener('CookiebotOnConsentReady', pushConsentUpdate);
    document.addEventListener('CookiebotOnAccept', pushConsentUpdate);
    document.addEventListener('CookiebotOnDecline', pushConsentUpdate);
  }
})();`,
      }}
    />
  );
}

/* Cookieless Google Analytics for dictum.report and its dictum-report.github.io mirror.
 *
 * WHY THIS FILE LOOKS LIKE THIS
 *
 * Every page footer promises "this website sets no cookies", so the tag runs with
 * Consent Mode defaulting analytics_storage to 'denied'. That is the ONLY mechanism
 * that actually suppresses the cookie in GA4.
 *
 * Do not "fix" this by switching to client_storage:'none'. That is a Universal
 * Analytics parameter; GA4 silently ignores it. Measured with headless Chrome on
 * 2026-07-27: with client_storage:'none' the tag still set _ga and _ga_3J1D694GLE.
 * With consent denied, document.cookie is empty and the hit still sends (gcs=G100).
 *
 * Consequence to remember when reading reports: with no storage, gtag mints a fresh
 * client_id per page load, so "Users" and "Sessions" are just synonyms for page loads.
 * Views, events, and traffic source are the real metrics. Unique-visitor counts come
 * from nginx logs (tools/funnel_report.sh), not from here.
 *
 * allow_google_signals:false matters as much as the storage setting. Google Signals
 * pings stats.g.doubleclick.net and sets a THIRD-PARTY cookie regardless of
 * client_storage, which would falsify the footer on all five pages. Signals is also
 * disabled property-side by tools/setup_ga4.sh; this is the other half of that.
 *
 * Nothing functional lives in this file. Ad-blockers and hospital proxies block
 * googletagmanager.com routinely, and when they do the only thing that may break is
 * measurement. The whole body is wrapped in try/catch for the same reason.
 *
 * Verified by tools/verify_ga.mjs (headless Chrome, asserts zero cookies).
 */
(function () {
    'use strict';
    try {
        var ID = 'G-3J1D694GLE';

        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        window.gtag = window.gtag || gtag;

        // Must precede 'js' and 'config'. Denying analytics_storage is what keeps the
        // "sets no cookies" promise true; the ad_* denials keep it that way if this
        // property is ever linked to Ads.
        gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied'
        });

        gtag('js', new Date());
        gtag('config', ID, {
            allow_google_signals: false,
            allow_ad_personalization_signals: false
        });

        var loader = document.createElement('script');
        loader.async = true;
        loader.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
        (document.head || document.documentElement).appendChild(loader);

        /* Download-click tracking.
         *
         * Delegated on purpose, not just for tidiness: index.html rewrites all three
         * of these hrefs on the github.io mirror, and rewrites #adv-exe again later
         * from latest.json. Binding to elements at load time would record stale URLs,
         * so the href is read at click time.
         *
         * No preventDefault and no event_callback. gtag already sends via
         * navigator.sendBeacon, and on both hosts the button starts a download without
         * navigating away. Intercepting the click would add latency and break
         * middle-click, ctrl-click and "Save Link As" — never trade a working download
         * button for a marginally more reliable analytics event.
         */
        var SELECTOR = '#dl-button, #adv-exe, #adv-zip';

        function record(e) {
            try {
                // auxclick also fires for right-click; only count middle-click.
                if (e.type === 'auxclick' && e.button !== 1) return;
                var el = e.target && e.target.closest ? e.target.closest(SELECTOR) : null;
                if (!el) return;
                window.gtag('event', 'download_click', {
                    link_id: el.id,
                    link_url: el.href
                });
            } catch (err) { /* measurement must never break the page */ }
        }

        document.addEventListener('click', record, true);
        document.addEventListener('auxclick', record, true);
    } catch (err) { /* no-op: analytics is never load-bearing */ }
})();

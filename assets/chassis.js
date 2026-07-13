/* ============================================================
   AristotleK12 (Sergeant Labs) - SHARED LP CHASSIS JS - build v1 2026-07-12
   PostHog funnel instrumentation + UTM/origin_path attribution bridge +
   Phosphor duotone icon hydration + mocked short-form + mobile helpers.
   Reused verbatim across every LP. Per-page config comes from <body> data-*.
   ASCII-clean. No opening Liquid tokens.
   ============================================================ */
(function () {
  "use strict";

  /* ---- viewport guard (in case a host/preview lacks the meta) ---- */
  try {
    if (!document.querySelector('meta[name="viewport"]')) {
      var mv = document.createElement("meta");
      mv.name = "viewport";
      mv.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover");
      (document.head || document.documentElement).appendChild(mv);
    }
  } catch (e) {}

  var BODY = document.body;
  var PAGE_NAME = (BODY && BODY.getAttribute("data-lp-page")) || "unknown";
  var THANKYOU_URL = (BODY && BODY.getAttribute("data-lp-thankyou")) || "";
  var PH_TOKEN = "phc_BE5poe2MtSUZHFqauPx5RTxxyU9wJjbyXH8ErksGSm4F"; /* Sergeant Labs PostHog project 509460 */
  var PH_HOST = "https://us.posthog.com";

  /* ============================================================
     1) PostHog init (real Sergeant Labs project)
     ============================================================ */
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  try {
    window.posthog.init(PH_TOKEN, {
      api_host: PH_HOST,
      person_profiles: "identified_only",
      capture_pageview: false,        /* we fire lp_pageview ourselves with UTM props */
      autocapture: true
    });
  } catch (e) {}

  /* ============================================================
     2) UTM / origin_path attribution bridge (sessionStorage)
     ============================================================ */
  var SS = "sgt_attr";
  var UTM_KEYS = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","gclid","gbraid","wbraid","msclkid","fbclid"];

  function readAttr() {
    var stored = {};
    try { stored = JSON.parse(sessionStorage.getItem(SS) || "{}"); } catch (e) {}
    var qs = new URLSearchParams(location.search);
    var touched = false;
    UTM_KEYS.forEach(function (k) {
      var v = qs.get(k);
      if (v) { stored[k] = v; touched = true; }
    });
    /* stamp origin_path ONCE per session (first LP the visitor landed on) */
    if (!stored.origin_path) {
      stored.origin_path = location.pathname;
      stored.origin_referrer = document.referrer || "direct";
      stored.origin_ts = new Date().toISOString();
      touched = true;
    }
    if (touched) { try { sessionStorage.setItem(SS, JSON.stringify(stored)); } catch (e) {} }
    return stored;
  }
  var ATTR = readAttr();

  /* Forward UTMs onto internal (same-host) links so cross-page nav keeps source */
  function forwardUtms() {
    var carry = {};
    UTM_KEYS.forEach(function (k) { if (ATTR[k]) carry[k] = ATTR[k]; });
    if (!Object.keys(carry).length) return;
    var links = document.querySelectorAll('a[href^="/"], a[href^="' + location.origin + '"]');
    links.forEach(function (a) {
      try {
        var u = new URL(a.getAttribute("href"), location.origin);
        Object.keys(carry).forEach(function (k) { if (!u.searchParams.has(k)) u.searchParams.set(k, carry[k]); });
        a.setAttribute("href", u.pathname + u.search + u.hash);
      } catch (e) {}
    });
  }

  /* ============================================================
     3) Unified track() - PostHog + window buffer + dataLayer
     ============================================================ */
  window.__lpEvents = window.__lpEvents || [];
  function track(event, props) {
    var payload = Object.assign({
      page_name: PAGE_NAME,
      lp_variant: "control",
      origin_path: ATTR.origin_path || location.pathname
    }, props || {});
    UTM_KEYS.forEach(function (k) { if (ATTR[k]) payload[k] = ATTR[k]; });
    try { if (window.posthog && window.posthog.capture) window.posthog.capture(event, payload); } catch (e) {}
    window.__lpEvents.push({ event: event, props: payload, t: Date.now() });
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: event }, payload));
    if (window.console && console.debug) console.debug("[lp] " + event, payload);
  }
  window.sgtTrack = track;

  /* ============================================================
     4) Phosphor duotone icon hydration
     ============================================================ */
  var ICONS = {
  'arrow-right': '<g fill="currentColor"><path d="m216 128l-72 72V56Z" opacity=".2"/><path d="m221.66 122.34l-72-72A8 8 0 0 0 136 56v64H40a8 8 0 0 0 0 16h96v64a8 8 0 0 0 13.66 5.66l72-72a8 8 0 0 0 0-11.32M152 180.69V75.31L204.69 128Z"/></g>',
  'buildings': '<g fill="currentColor"><path d="M136 32v184H40V85.35a8 8 0 0 1 3.56-6.66l80-53.33A8 8 0 0 1 136 32" opacity=".2"/><path d="M240 208h-16V96a16 16 0 0 0-16-16h-64V32a16 16 0 0 0-24.88-13.32L39.12 72A16 16 0 0 0 32 85.34V208H16a8 8 0 0 0 0 16h224a8 8 0 0 0 0-16M208 96v112h-64V96ZM48 85.34L128 32v176H48ZM112 112v16a8 8 0 0 1-16 0v-16a8 8 0 1 1 16 0m-32 0v16a8 8 0 0 1-16 0v-16a8 8 0 1 1 16 0m0 56v16a8 8 0 0 1-16 0v-16a8 8 0 0 1 16 0m32 0v16a8 8 0 0 1-16 0v-16a8 8 0 0 1 16 0"/></g>',
  'certificate': '<g fill="currentColor"><path d="M224 56v34.06a44 44 0 1 0-56 67.88V192H40a8 8 0 0 1-8-8V56a8 8 0 0 1 8-8h176a8 8 0 0 1 8 8" opacity=".2"/><path d="M128 136a8 8 0 0 1-8 8H72a8 8 0 0 1 0-16h48a8 8 0 0 1 8 8m-8-40H72a8 8 0 0 0 0 16h48a8 8 0 0 0 0-16m112 65.47V224a8 8 0 0 1-12 7l-24-13.74L172 231a8 8 0 0 1-12-7v-24H40a16 16 0 0 1-16-16V56a16 16 0 0 1 16-16h176a16 16 0 0 1 16 16v30.53a51.88 51.88 0 0 1 0 74.94M160 184v-22.53A52 52 0 0 1 216 76V56H40v128Zm56-12a51.88 51.88 0 0 1-40 0v38.22l16-9.16a8 8 0 0 1 7.94 0l16 9.16Zm16-48a36 36 0 1 0-36 36a36 36 0 0 0 36-36"/></g>',
  'chalkboard-simple': '<g fill="currentColor"><path d="M224 56v112h-64v32H32V56a8 8 0 0 1 8-8h176a8 8 0 0 1 8 8" opacity=".2"/><path d="M240 192h-8v-24a8 8 0 0 0-8-8h-64a8 8 0 0 0-8 8v24H40V56h176v80a8 8 0 0 0 16 0V56a16 16 0 0 0-16-16H40a16 16 0 0 0-16 16v136h-8a8 8 0 0 0 0 16h224a8 8 0 0 0 0-16m-72-16h48v16h-48Z"/></g>',
  'check-circle': '<g fill="currentColor"><path d="M224 128a96 96 0 1 1-96-96a96 96 0 0 1 96 96" opacity=".2"/><path d="M173.66 98.34a8 8 0 0 1 0 11.32l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 0M232 128A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104m-16 0a88 88 0 1 0-88 88a88.1 88.1 0 0 0 88-88"/></g>',
  'cursor-click': '<g fill="currentColor"><path d="M213.66 201L201 213.66a8 8 0 0 1-11.31 0l-51.31-51.31a8 8 0 0 0-13 2.46l-17.82 46.41a8 8 0 0 1-14.85-.71L40.41 50.44a8 8 0 0 1 10-10l160.1 52.24a8 8 0 0 1 .71 14.85l-46.41 17.82a8 8 0 0 0-2.46 13l51.31 51.31a8 8 0 0 1 0 11.34" opacity=".2"/><path d="M88 24v-8a8 8 0 0 1 16 0v8a8 8 0 0 1-16 0m-72 80h8a8 8 0 0 0 0-16h-8a8 8 0 0 0 0 16m108.42-64.84a8 8 0 0 0 10.74-3.58l8-16a8 8 0 0 0-14.31-7.16l-8 16a8 8 0 0 0 3.57 10.74m-96 81.69l-16 8a8 8 0 0 0 7.16 14.31l16-8a8 8 0 1 0-7.16-14.31M219.31 184a16 16 0 0 1 0 22.63l-12.68 12.68a16 16 0 0 1-22.63 0L132.7 168L115 214.09c0 .1-.08.21-.13.32a15.83 15.83 0 0 1-14.6 9.59h-.79a15.83 15.83 0 0 1-14.41-11L32.8 52.92A16 16 0 0 1 52.92 32.8L213 85.07a16 16 0 0 1 1.41 29.8l-.32.13L168 132.69ZM208 195.31L156.69 144a16 16 0 0 1 4.93-26l.32-.14l45.95-17.64L48 48l52.2 159.86l17.65-46c0-.11.08-.22.13-.33a16 16 0 0 1 11.69-9.34a16.7 16.7 0 0 1 3-.28a16 16 0 0 1 11.3 4.69l51.34 51.4Z"/></g>',
  'devices': '<g fill="currentColor"><path d="M200 64v16h-24a16 16 0 0 0-16 16v80H40a16 16 0 0 1-16-16V64a16 16 0 0 1 16-16h144a16 16 0 0 1 16 16" opacity=".2"/><path d="M224 72h-16v-8a24 24 0 0 0-24-24H40a24 24 0 0 0-24 24v96a24 24 0 0 0 24 24h112v8a24 24 0 0 0 24 24h48a24 24 0 0 0 24-24V96a24 24 0 0 0-24-24M40 168a8 8 0 0 1-8-8V64a8 8 0 0 1 8-8h144a8 8 0 0 1 8 8v8h-16a24 24 0 0 0-24 24v72Zm192 24a8 8 0 0 1-8 8h-48a8 8 0 0 1-8-8V96a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8Zm-96 16a8 8 0 0 1-8 8H88a8 8 0 0 1 0-16h40a8 8 0 0 1 8 8m80-96a8 8 0 0 1-8 8h-16a8 8 0 0 1 0-16h16a8 8 0 0 1 8 8"/></g>',
  'eye': '<g fill="currentColor"><path d="M128 56c-80 0-112 72-112 72s32 72 112 72s112-72 112-72s-32-72-112-72m0 112a40 40 0 1 1 40-40a40 40 0 0 1-40 40" opacity=".2"/><path d="M247.31 124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57 61.26 162.88 48 128 48S61.43 61.26 36.34 86.35C17.51 105.18 9 124 8.69 124.76a8 8 0 0 0 0 6.5c.35.79 8.82 19.57 27.65 38.4C61.43 194.74 93.12 208 128 208s66.57-13.26 91.66-38.34c18.83-18.83 27.3-37.61 27.65-38.4a8 8 0 0 0 0-6.5M128 192c-30.78 0-57.67-11.19-79.93-33.25A133.5 133.5 0 0 1 25 128a133.3 133.3 0 0 1 23.07-30.75C70.33 75.19 97.22 64 128 64s57.67 11.19 79.93 33.25A133.5 133.5 0 0 1 231.05 128c-7.21 13.46-38.62 64-103.05 64m0-112a48 48 0 1 0 48 48a48.05 48.05 0 0 0-48-48m0 80a32 32 0 1 1 32-32a32 32 0 0 1-32 32"/></g>',
  'file-lock': '<g fill="currentColor"><path d="M48 184h72v40H48ZM152 32v56h56Z" opacity=".2"/><path d="M120 176h-8v-4a28 28 0 0 0-56 0v4h-8a8 8 0 0 0-8 8v40a8 8 0 0 0 8 8h72a8 8 0 0 0 8-8v-40a8 8 0 0 0-8-8m-48-4a12 12 0 0 1 24 0v4H72Zm40 44H56v-24h56ZM213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v88a8 8 0 0 0 16 0V40h88v48a8 8 0 0 0 8 8h48v120h-40a8 8 0 0 0 0 16h40a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66M160 51.31L188.69 80H160Z"/></g>',
  'graduation-cap': '<g fill="currentColor"><path d="M216 113.07v53.22a8 8 0 0 1-2 5.31c-11.3 12.59-38.9 36.4-86 36.4s-74.68-23.81-86-36.4a8 8 0 0 1-2-5.31v-53.22L128 160Z" opacity=".2"/><path d="m251.76 88.94l-120-64a8 8 0 0 0-7.52 0l-120 64a8 8 0 0 0 0 14.12L32 117.87v48.42a15.9 15.9 0 0 0 4.06 10.65C49.16 191.53 78.51 216 128 216a130 130 0 0 0 48-8.76V240a8 8 0 0 0 16 0v-40.49a115.6 115.6 0 0 0 27.94-22.57a15.9 15.9 0 0 0 4.06-10.65v-48.42l27.76-14.81a8 8 0 0 0 0-14.12M128 200c-43.27 0-68.72-21.14-80-33.71V126.4l76.24 40.66a8 8 0 0 0 7.52 0L176 143.47v46.34c-12.6 5.88-28.48 10.19-48 10.19m80-33.75a97.8 97.8 0 0 1-16 14.25v-45.57l16-8.53Zm-20-47.31l-.22-.13l-56-29.87a8 8 0 0 0-7.52 14.12L171 128l-43 22.93L25 96l103-54.93L231 96Z"/></g>',
  'hand-waving': '<g fill="currentColor"><path d="M184 213.27A80 80 0 0 1 74.7 184l-40-69.32a20 20 0 0 1 34.64-20L55.08 70a20 20 0 0 1 34.65-20l6.92 12a20 20 0 0 1 34.64-20l30 52A20 20 0 0 1 196 74l17.31 30A80 80 0 0 1 184 213.27" opacity=".2"/><path d="m220.17 100l-17.31-30a28 28 0 0 0-38.24-10.25a27.7 27.7 0 0 0-9 8.34L138.2 38a28 28 0 0 0-48.48 0a28 28 0 0 0-41.57 36l1.59 2.76A27.7 27.7 0 0 0 38 80.41a28 28 0 0 0-10.24 38.25l40 69.32a87.47 87.47 0 0 0 53.43 41a88.6 88.6 0 0 0 22.92 3a88 88 0 0 0 76.06-132Zm-6.66 62.64A72 72 0 0 1 81.62 180l-40-69.32a12 12 0 0 1 20.78-12L81.63 132a8 8 0 1 0 13.85-8L62 66a12 12 0 1 1 20.78-12L114 108a8 8 0 1 0 13.85-8l-24.28-42a12 12 0 1 1 20.78-12l33.42 57.9a48 48 0 0 0-5.54 60.6a8 8 0 0 0 13.24-9a32 32 0 0 1 7.31-43.5a8 8 0 0 0 2.13-10.4L168.23 90A12 12 0 1 1 189 78l17.31 30a71.56 71.56 0 0 1 7.2 54.62ZM184.25 31.71A8 8 0 0 1 194 26a59.62 59.62 0 0 1 36.53 28l.33.57a8 8 0 1 1-13.85 8l-.33-.57a43.67 43.67 0 0 0-26.8-20.5a8 8 0 0 1-5.63-9.79M80.89 237a8 8 0 0 1-11.23 1.33A119.6 119.6 0 0 1 40.06 204a8 8 0 0 1 13.86-8a103.7 103.7 0 0 0 25.64 29.72A8 8 0 0 1 80.89 237"/></g>',
  'headset': '<g fill="currentColor"><path d="M80 144v40a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16v-56h32a16 16 0 0 1 16 16m112-16a16 16 0 0 0-16 16v40a16 16 0 0 0 16 16h32v-72Z" opacity=".2"/><path d="M201.89 54.66A104.08 104.08 0 0 0 24 128v56a24 24 0 0 0 24 24h16a24 24 0 0 0 24-24v-40a24 24 0 0 0-24-24H40.36a88.12 88.12 0 0 1 150.18-54.07A87.4 87.4 0 0 1 215.65 120H192a24 24 0 0 0-24 24v40a24 24 0 0 0 24 24h24a24 24 0 0 1-24 24h-56a8 8 0 0 0 0 16h56a40 40 0 0 0 40-40v-80a103.4 103.4 0 0 0-30.11-73.34M64 136a8 8 0 0 1 8 8v40a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8v-48Zm128 56a8 8 0 0 1-8-8v-40a8 8 0 0 1 8-8h24v56Z"/></g>',
  'lightning': '<g fill="currentColor"><path d="m96 240l16-80l-64-24L160 16l-16 80l64 24Z" opacity=".2"/><path d="M215.79 118.17a8 8 0 0 0-5-5.66L153.18 90.9l14.66-73.33a8 8 0 0 0-13.69-7l-112 120a8 8 0 0 0 3 13l57.63 21.61l-14.62 73.25a8 8 0 0 0 13.69 7l112-120a8 8 0 0 0 1.94-7.26M109.37 214l10.47-52.38a8 8 0 0 0-5-9.06L62 132.71l84.62-90.66l-10.46 52.38a8 8 0 0 0 5 9.06l52.8 19.8Z"/></g>',
  'lock-key': '<g fill="currentColor"><path d="M208 88H48a8 8 0 0 0-8 8v112a8 8 0 0 0 8 8h160a8 8 0 0 0 8-8V96a8 8 0 0 0-8-8m-80 72a20 20 0 1 1 20-20a20 20 0 0 1-20 20" opacity=".2"/><path d="M208 80h-32V56a48 48 0 0 0-96 0v24H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16M96 56a32 32 0 0 1 64 0v24H96Zm112 152H48V96h160zm-80-96a28 28 0 0 0-8 54.83V184a8 8 0 0 0 16 0v-17.17a28 28 0 0 0-8-54.83m0 40a12 12 0 1 1 12-12a12 12 0 0 1-12 12"/></g>',
  'map-pin': '<g fill="currentColor"><path d="M128 24a80 80 0 0 0-80 80c0 72 80 128 80 128s80-56 80-128a80 80 0 0 0-80-80m0 112a32 32 0 1 1 32-32a32 32 0 0 1-32 32" opacity=".2"/><path d="M128 64a40 40 0 1 0 40 40a40 40 0 0 0-40-40m0 64a24 24 0 1 1 24-24a24 24 0 0 1-24 24m0-112a88.1 88.1 0 0 0-88 88c0 31.4 14.51 64.68 42 96.25a254.2 254.2 0 0 0 41.45 38.3a8 8 0 0 0 9.18 0a254.2 254.2 0 0 0 41.37-38.3c27.45-31.57 42-64.85 42-96.25a88.1 88.1 0 0 0-88-88m0 206c-16.53-13-72-60.75-72-118a72 72 0 0 1 144 0c0 57.23-55.47 105-72 118"/></g>',
  'monitor-play': '<g fill="currentColor"><path d="M208 48H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16m-96 104V88l48 32Z" opacity=".2"/><path d="M208 40H48a24 24 0 0 0-24 24v112a24 24 0 0 0 24 24h160a24 24 0 0 0 24-24V64a24 24 0 0 0-24-24m8 136a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8V64a8 8 0 0 1 8-8h160a8 8 0 0 1 8 8Zm-48 48a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8m-3.56-110.66l-48-32A8 8 0 0 0 104 88v64a8 8 0 0 0 12.44 6.66l48-32a8 8 0 0 0 0-13.32M120 137.05V103l25.58 17Z"/></g>',
  'plugs-connected': '<g fill="currentColor"><path d="m185 127l-58 58a24 24 0 0 1-33.94 0L71 162.91A24 24 0 0 1 71 129l58-58a24 24 0 0 1 33.94 0L185 93.09a24 24 0 0 1 0 33.91" opacity=".2"/><path d="M237.66 18.34a8 8 0 0 0-11.32 0l-52.4 52.41l-5.37-5.38a32.05 32.05 0 0 0-45.26 0L100 88.69l-6.34-6.35a8 8 0 0 0-11.32 11.32l6.35 6.34l-23.32 23.31a32 32 0 0 0 0 45.26l5.38 5.37l-52.41 52.4a8 8 0 0 0 11.32 11.32l52.4-52.41l5.37 5.38a32.06 32.06 0 0 0 45.26 0L156 167.31l6.34 6.35a8 8 0 0 0 11.32-11.32l-6.35-6.34l23.32-23.31a32 32 0 0 0 0-45.26l-5.38-5.37l52.41-52.4a8 8 0 0 0 0-11.32m-116.29 161a16 16 0 0 1-22.62 0l-22.06-22.09a16 16 0 0 1 0-22.62L100 111.31L144.69 156Zm57.94-57.94L156 144.69L111.31 100l23.32-23.31a16 16 0 0 1 22.62 0l22.06 22a16 16 0 0 1 0 22.63ZM88.57 35a8 8 0 0 1 14.86-6l8 20a8 8 0 0 1-14.86 6Zm-64 58A8 8 0 0 1 35 88.57l20 8a8 8 0 0 1-6 14.86l-20-8A8 8 0 0 1 24.57 93m206.86 70a8 8 0 0 1-10.4 4.46l-20-8a8 8 0 1 1 5.97-14.89l20 8a8 8 0 0 1 4.43 10.43m-64 58.06a8 8 0 0 1-14.86 5.94l-8-20a8 8 0 0 1 14.86-6Z"/></g>',
  'shield-check': '<g fill="currentColor"><path d="M216 56v56c0 96-88 120-88 120s-88-24-88-120V56a8 8 0 0 1 8-8h160a8 8 0 0 1 8 8" opacity=".2"/><path d="M208 40H48a16 16 0 0 0-16 16v56c0 52.72 25.52 84.67 46.93 102.19c23.06 18.86 46 25.26 47 25.53a8 8 0 0 0 4.2 0c1-.27 23.91-6.67 47-25.53C198.48 196.67 224 164.72 224 112V56a16 16 0 0 0-16-16m0 72c0 37.07-13.66 67.16-40.6 89.42a129.3 129.3 0 0 1-39.4 22.2a128.3 128.3 0 0 1-38.92-21.81C61.82 179.51 48 149.3 48 112V56h160ZM82.34 141.66a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32l-56 56a8 8 0 0 1-11.32 0Z"/></g>',
  'stack': '<g fill="currentColor"><path d="m224 80l-96 56l-96-56l96-56Z" opacity=".2"/><path d="M230.91 172a8 8 0 0 1-2.91 10.91l-96 56a8 8 0 0 1-8.06 0l-96-56A8 8 0 0 1 36 169.09l92 53.65l92-53.65a8 8 0 0 1 10.91 2.91M220 121.09l-92 53.65l-92-53.65a8 8 0 0 0-8 13.82l96 56a8 8 0 0 0 8.06 0l96-56a8 8 0 1 0-8.06-13.82M24 80a8 8 0 0 1 4-6.91l96-56a8 8 0 0 1 8.06 0l96 56a8 8 0 0 1 0 13.82l-96 56a8 8 0 0 1-8.06 0l-96-56A8 8 0 0 1 24 80m23.88 0L128 126.74L208.12 80L128 33.26Z"/></g>',
  'tag': '<g fill="currentColor"><path d="M237.66 153L153 237.66a8 8 0 0 1-11.31 0l-99.35-99.32a8 8 0 0 1-2.34-5.65V40h92.69a8 8 0 0 1 5.65 2.34l99.32 99.32a8 8 0 0 1 0 11.34" opacity=".2"/><path d="M243.31 136L144 36.69A15.86 15.86 0 0 0 132.69 32H40a8 8 0 0 0-8 8v92.69A15.86 15.86 0 0 0 36.69 144L136 243.31a16 16 0 0 0 22.63 0l84.68-84.68a16 16 0 0 0 0-22.63m-96 96L48 132.69V48h84.69L232 147.31ZM96 84a12 12 0 1 1-12-12a12 12 0 0 1 12 12"/></g>',
  'timer': '<g fill="currentColor"><path d="M216 136a88 88 0 1 1-88-88a88 88 0 0 1 88 88" opacity=".2"/><path d="M128 40a96 96 0 1 0 96 96a96.11 96.11 0 0 0-96-96m0 176a80 80 0 1 1 80-80a80.09 80.09 0 0 1-80 80m45.66-125.66a8 8 0 0 1 0 11.32l-40 40a8 8 0 0 1-11.32-11.32l40-40a8 8 0 0 1 11.32 0M96 16a8 8 0 0 1 8-8h48a8 8 0 0 1 0 16h-48a8 8 0 0 1-8-8"/></g>',
  'x-circle': '<g fill="currentColor"><path d="M224 128a96 96 0 1 1-96-96a96 96 0 0 1 96 96" opacity=".2"/><path d="M165.66 101.66L139.31 128l26.35 26.34a8 8 0 0 1-11.32 11.32L128 139.31l-26.34 26.35a8 8 0 0 1-11.32-11.32L116.69 128l-26.35-26.34a8 8 0 0 1 11.32-11.32L128 116.69l26.34-26.35a8 8 0 0 1 11.32 11.32M232 128A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104m-16 0a88 88 0 1 0-88 88a88.1 88.1 0 0 0 88-88"/></g>',
  };
  function hydrateIcons(root) {
    (root || document).querySelectorAll("[data-ph]").forEach(function (el) {
      if (el.getAttribute("data-ph-done")) return;
      var name = el.getAttribute("data-ph");
      var g = ICONS[name];
      if (!g) return;
      el.classList.add("ph");
      el.innerHTML = '<svg viewBox="0 0 256 256" aria-hidden="true" focusable="false">' + g + "</svg>";
      el.setAttribute("data-ph-done", "1");
    });
  }

  /* ============================================================
     5) CTA click tracking
     ============================================================ */
  function wireCtas() {
    document.querySelectorAll("[data-cta]").forEach(function (el) {
      el.addEventListener("click", function () {
        track("cta_clicked", { cta_id: el.getAttribute("data-cta") || "cta", cta_text: (el.textContent || "").trim().slice(0, 40) });
      });
    });
  }

  /* ============================================================
     6) Mocked short-form + inline thank-you (preview only)
        Fields map 1:1 to the trimmed Gravity Forms form (see field-map doc).
     ============================================================ */
  function wireForm() {
    var form = document.querySelector("[data-lp-form]");
    if (!form) return;
    var engaged = false;
    form.addEventListener("focusin", function () {
      if (engaged) return;
      engaged = true;
      track("form_engaged", { form_id: "demo-shortform" });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      /* validate required fields */
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (f) {
        var val = (f.value || "").trim();
        if (!val || (f.type === "email" && val.indexOf("@") < 0)) {
          f.classList.add("field-err"); ok = false;
        } else { f.classList.remove("field-err"); }
      });
      track("submit_attempted", { form_id: "demo-shortform", valid: ok });
      if (!ok) {
        var bad = form.querySelector(".field-err");
        if (bad) bad.focus();
        return;
      }
      var data = {
        role: (form.querySelector('[name="role"]') || {}).value || "",
        device_count: (form.querySelector('[name="device_count"]') || {}).value || "",
        timeframe: (form.querySelector('[name="timeframe"]') || {}).value || ""
      };
      /* PREVIEW: no real backend. Fire the conversion event + show inline thank-you.
         On WP ship, Gravity Forms handles POST + redirect to THANKYOU_URL. */
      track("lead_form_submitted", Object.assign({ form_id: "demo-shortform", thankyou_url: THANKYOU_URL }, data));
      try {
        if (window.posthog && window.posthog.identify && data && document.querySelector('[name="email"]')) {
          /* identify by district email domain-safe: only in preview to make funnel person-linked */
        }
      } catch (e) {}
      var card = form.closest("[data-form-card]") || form.parentNode;
      var ty = card.querySelector("[data-ty]");
      form.style.display = "none";
      if (ty) { ty.classList.add("is-on"); ty.scrollIntoView({ behavior: "smooth", block: "center" }); }
    });
  }

  /* ============================================================
     7) Scroll reveal (with no-content-hidden failsafe)
     ============================================================ */
  function wireReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () { els.forEach(function (el) { el.classList.add("in"); }); }, 1500); /* failsafe */
  }

  /* ============================================================
     8) Boot
     ============================================================ */
  function boot() {
    hydrateIcons(document);
    forwardUtms();
    wireCtas();
    wireForm();
    wireReveal();
    track("lp_pageview", { path: location.pathname, referrer: document.referrer || "direct" });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

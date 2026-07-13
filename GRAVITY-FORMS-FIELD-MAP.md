# AristotleK12 short-form &mdash; Gravity Forms field map (WordPress port)

Maps the mocked 6-field preview form 1:1 to a trimmed Gravity Forms form so the WP embed is copy-paste. Replaces the current 31-field / product-picker `gform_15`.

**Open item to confirm with Nik / Braden before WP ship:** where does the current `gform_15` route on submit &mdash; email notification only, or a CRM / Zapier feed? Whatever it is, rebuild the notification + feed on the trimmed form so nothing downstream breaks.

---

## 1. Visible fields (6) &mdash; the whole form

| # | Preview field (`name=`) | Gravity Forms field type | GF field label | Required | Choices |
|---|---|---|---|---|---|
| 1 | `name` | Single Line Text (or Name &rarr; Simple) | Name | Yes | &mdash; |
| 2 | `district` | Single Line Text | District / Organization | Yes | &mdash; |
| 3 | `role` | Drop Down | Your role | Yes | Director of Technology &middot; Network / Systems Admin &middot; Principal / Administrator &middot; Other |
| 4 | `email` | Email | District email | Yes | &mdash; (turn on email format validation) |
| 5 | `device_count` | Drop Down | Approx. devices | Yes | Under 500 &middot; 500 - 2,000 &middot; 2,000 - 5,000 &middot; 5,000 - 10,000 &middot; 10,000+ |
| 6 | `timeframe` | Drop Down | Timeframe | Yes | Contract expiring soon &middot; Evaluating now &middot; Just researching |

Keep the option **text** identical to the table above &mdash; PostHog segments leads on `role`, `device_count` and `timeframe`, so the strings must match across preview and production.

**Explicitly removed vs the old form:** the "choose which product" picker and the "how did you hear about us" field. Do not re-add them.

## 2. Hidden attribution fields (6) &mdash; add as GF "Hidden" fields, "Allow dynamic population" ON

| GF hidden field label | Parameter name |
|---|---|
| UTM Source | `utm_source` |
| UTM Medium | `utm_medium` |
| UTM Campaign | `utm_campaign` |
| UTM Content | `utm_content` |
| Google Click ID | `gclid` |
| Origin Path | `origin_path` |

Gravity Forms auto-populates a dynamic field from the query string, but our attribution lives in the `sgt_attr` sessionStorage bridge (so it survives cross-page hops). Add this snippet to the WP page/footer so the hidden GF inputs fill from the bridge on load:

```html
<script>
(function(){
  try{
    var a=JSON.parse(sessionStorage.getItem("sgt_attr")||"{}");
    ["utm_source","utm_medium","utm_campaign","utm_content","gclid","origin_path"].forEach(function(k){
      document.querySelectorAll('input[name^="input_"]').forEach(function(el){
        if((el.getAttribute("data-sgt")||"")===k && a[k]) el.value=a[k];
      });
    });
  }catch(e){}
})();
</script>
```
(Tag each hidden GF input with `data-sgt="utm_source"` etc. via the field's CSS-class/custom-attribute, or just rely on GF's query-string population plus the chassis UTM forwarding on internal links.)

## 3. Confirmation / thank-you (per page &mdash; distinct URLs for conversion tracking)

Set each embed's Gravity Forms **Confirmation &rarr; Redirect** to its own thank-you URL. Distinct URLs are what let Google/Meta conversion tags and the PostHog funnel attribute a lead to the right page.

| Page | GF confirmation redirect |
|---|---|
| `/compare/goguardian` | `/compare/goguardian/thank-you/` |
| `/classroom-control-software` | `/classroom-control-software/thank-you/` |
| `/see-it-work` | `/see-it-work/thank-you/` |

Pass the UTM query through on the redirect (GF "Pass Field Data via Query String") so the thank-you `lp_pageview` keeps its source. The Calendly "Grab a time now" accelerator lives on each thank-you view (swap the placeholder `https://calendly.com/aristotlek12/demo` for the real Calendly link).

## 4. Events that must keep firing after the swap

On preview these fire from `chassis.js` off the mocked form. On WordPress, keep them firing against the real GF form:

| Event | Trigger | How to keep it on GF |
|---|---|---|
| `lp_pageview` | page load | chassis.js already handles it |
| `form_engaged` | first field focus | chassis.js `focusin` on `[data-lp-form]` &mdash; add `data-lp-form` to the GF `<form>` (or rebind to `.gform_wrapper`) |
| `submit_attempted` | submit click | bind to GF `submit` |
| `lead_form_submitted` | successful submit | fire on the GF **`gform_confirmation_loaded`** JS hook (AJAX) OR on the thank-you `lp_pageview` |

Simplest production wiring: fire `lead_form_submitted` from the thank-you page load (it is a dedicated URL reached only on success), and keep `form_engaged` / `submit_attempted` bound to the GF wrapper. A short `gform-bridge.js` for this ships at WP time.

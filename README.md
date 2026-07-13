# AristotleK12 (Sergeant Labs) &mdash; LP previews

Wave-1 evergreen, non-brand **demo-generation** landing pages for AristotleK12, built by Scale House Media for Chamber Media. GitHub Pages previews for internal approval (Draw Lucy model) &mdash; **not** the client's live WordPress. All pages are `noindex,nofollow`.

Managed channels: Google Ads + Reddit Ads. Universal CTA: **Schedule a Demo.** July 1 is the revenue window.

## Pages

| Path | Purpose | Paid destination |
|---|---|---|
| `/compare/goguardian/` | GoGuardian switcher / conquest. Head-to-head table + privacy contrast + "what switching takes." **Wave-2 clone template.** | Competitor Conquest Search (GoGuardian = 84% of conquest impressions) |
| `/classroom-control-software/` | Non-brand category page. "Wreaking havoc" hook, all-in-one control grid, CIPA-ready. | Q3 Non-Brand Search (`classroom control software`, ~1,900/mo, low comp) |
| `/see-it-work/` | Complexity-objection walkthrough. Stopwatch-Setup video hero, 3 steps to live, annotated dashboard. | Reddit + resumed PMax (curiosity-driven) |

Each page has a distinct thank-you URL (`.../thank-you/`) for per-page conversion tracking. Hub index at `/`.

## The shared chassis (spin Wave-2 clones fast)

Everything visual + behavioral lives in two files. A new comparison clone (Securly / Lightspeed / Linewize / Impero) = copy `compare/goguardian/index.html`, swap the H1, the comparison-table rows, and the VOC cards. No CSS/JS changes.

- **`assets/chassis.css`** &mdash; the whole design system. Blue-forward palette (`--blue #0373fe`, `--blue-deep #003399`, `--cyan #00bffd`), Poppins + Roboto, one CTA color, card/hero/comparison/spine/FAQ/video/annotated-dashboard components, mobile-first responsive (form renders **above** hero copy on mobile &mdash; the +37% CVR pattern), sticky mobile CTA, scroll-reveal, `prefers-reduced-motion` guard, focus-visible rings.
- **`assets/chassis.js`** &mdash; the whole behavior layer:
  - PostHog init against the **Sergeant Labs** project (`509460`) &mdash; funnel events `lp_pageview`, `cta_clicked`, `form_engaged`, `submit_attempted`, `lead_form_submitted`, each stamped with `page_name` (from `<body data-lp-page>`), UTM params + `origin_path`.
  - UTM / `origin_path` attribution bridge in `sessionStorage` (`sgt_attr`) &mdash; captured on first LP, forwarded across pages; each page gets its own lead-source attribution.
  - Phosphor **duotone** icon hydration (22 icons baked inline, ASCII-clean, zero runtime deps) &mdash; author with `<i data-ph="shield-check" class="ph-duo"></i>`.
  - Mocked short-form + inline thank-you (with Calendly accelerator). On WP, Gravity Forms replaces the mock.

Per-page config is 100% in `<body>` data-attributes (`data-lp-page`, `data-lp-thankyou`) &mdash; the chassis files never change per page.

## Placeholders (swap on Chamber delivery)

- "Stopwatch Setup" **video block** (pages 1 &amp; 3) &mdash; `.videoblk`, drop in the real embed.
- Annotated **dashboard** "Concept 4" (page 3) &mdash; `.shot` mock + numbered `.pin`s, swap for the real annotated screenshot.
- **Calendly** link `https://calendly.com/aristotlek12/demo` &mdash; replace with the real one.

## Preview locally

```bash
python3 -m http.server 8799
# http://localhost:8799/compare/goguardian/index.html?utm_source=test&utm_campaign=verify
```

## Deploy / redeploy (GitHub Pages)

Repo is served at `https://ksimmons0420.github.io/sgtlabs-lp-previews/`. To redeploy after edits:

```bash
cd sgtlabs-lp-previews
# GUARDRAIL 1: committed HTML/MD must contain zero OPENING Liquid tokens or
# a legacy Jekyll build fails the WHOLE site. (Tokens built via chr() so this
# guardrail file itself stays clean.)
python3 - <<'PY'
import glob
tok=[chr(123)*2, chr(123)+chr(37)]  # the two opening Liquid tokens
bad=[f for f in glob.glob('**/*.html',recursive=True)+glob.glob('**/*.md',recursive=True)
     if any(t in open(f,encoding='utf-8').read() for t in tok)]
print('liquid-token files (must be 0):', len(bad), bad)
PY
# GUARDRAIL 2: ASCII-only
for f in $(find . -name '*.html' -o -name '*.css' -o -name '*.js'); do \
  python3 -c "print('$f', sum(ord(c)>127 for c in open('$f',encoding='utf-8').read()))"; done   # all 0
git add -A && git commit -m "update LPs" && git push
# verify (build can take 1-10 min):
gh api repos/ksimmons0420/sgtlabs-lp-previews/pages/builds/latest --jq '{status,error:.error.message}'
curl -s -o /dev/null -w "%{http_code}\n" https://ksimmons0420.github.io/sgtlabs-lp-previews/compare/goguardian/
```

`.nojekyll` is present, but the Liquid-free rule still stands as belt-and-suspenders (a legacy Pages build has been seen to run Jekyll anyway).

## WordPress ship checklist (post-approval, manual)

1. Rebuild the trimmed 6-field Gravity Forms form per `GRAVITY-FORMS-FIELD-MAP.md`; confirm `gform_15` routing with Nik first.
2. Enqueue `chassis.css` + `chassis.js` (or inline); asset paths become absolute (`/wp-content/...`) instead of the preview's relative paths.
3. Set per-page GF confirmation redirects to the distinct thank-you URLs.
4. Swap the 3 placeholders (video, dashboard, Calendly).
5. Repoint the two PAUSED "[STAGED]" Q3 campaigns' ads from the bare homepage to these URLs before launch.

## Compliance

Copy honors the Sergeant Labs bans: no "student safety" / "protecting kids" / "online safety" framing, "educator" never "teacher", no "free" / "cheap" / "proctoring" / student-facing language. "No charge for updates or new features" used for the included-updates claim. Comparison uses hedged, descriptive competitor language + a trademark footnote. Verified via grep gate (all banned terms = 0).

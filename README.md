# کلینیک دامپزشکی روما

Landing page for **Roma Veterinary Clinic**, Niavaran, Tehran. Static single-file site: `index.html` plus `assets/`. No build step, no framework, no runtime dependencies.

Persian (`lang="fa"`), RTL, mobile-first. Warm softened neo-brutalist design system with Vazirmatn.

## Sections

`hero` · `ticker` · `stats` · `services` · `surgery` · `doctor` · `process` · `gallery` · `reviews` · `book` · `contact` · `faq` · `cta` · `footer`

## Features

- Sticky navigation with scroll-spy and a mobile drawer (burger, close button, scrim, `Escape`, link-click)
- Mobile sticky action bar (call + book) with safe-area insets; auto-hides over the booking form
- Booking form with live validation, Persian-digit phone handling, success recap and reset
- Reveal-on-scroll animations, marquee ticker, lightbox gallery, FAQ accordions
- 16px form controls to prevent iOS zoom; 44px minimum touch targets
- No horizontal overflow from 320px to 1920px

## Local development

```bash
python3 -m http.server 4321
# open http://localhost:4321
```

Any static server works. There is no build, bundler or install step.

## Deployment

Deploys as-is to Vercel, Netlify, GitHub Pages or any static host. The repository root is the web root.

## Asset generation

`assets/*.jpg` are AI-generated illustrations produced with `gen.mjs` and `gen2.mjs` (Kie.ai Seedream). These scripts are for local asset regeneration only and are excluded from deployment and from version control.

```bash
cp .env.example .env   # then set KIE_API_KEY
node gen.mjs           # hero, cat, pattern
node gen2.mjs          # doctor portrait, care room
```

The committed illustrations are already optimized; regenerating is rarely needed.

## Content status

Some values are still placeholders pending confirmation from the clinic:

- `info@roma-vet.ir` — contact email
- Opening hours
- Service prices
- Doctor's first name (page currently reads «دکتر حسینی»)

The booking form validates and confirms locally but has no backend submission endpoint.

## Tech notes

- `index.html` is self-contained: all CSS (~34KB) and JS (~6KB) are inline
- Only external dependency is Vazirmatn from Google Fonts
- Images are plain JPEGs with explicit `width`/`height` and `alt` text; six of seven are lazy-loaded
- `assets/paw-pattern.jpg` is unused and git-ignored

## Contact

- Address: نیاوران، کاشانک، خیابان پورابتهاج، بن بست طائی، پلاک ۶، طبقه اول
- Landline: ۰۲۱ — ۲۶۲۴۸۷۷۲
- Mobile / emergency: ۰۹۱۲ — ۴۴۷۵۸۳۷
- Instagram: [@roma_pet_clinic](https://instagram.com/roma_pet_clinic)

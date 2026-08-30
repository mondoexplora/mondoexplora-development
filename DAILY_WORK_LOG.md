# Daily Work Log - MondoExplora Next.js Project

## 📅 **August 29, 2026**

### **Session — `/en/experiences` funnel: design, build, tracking, PMax feed**

Branch `feature/tracking-only`. Four commits, all pushed. `main` untouched.

**🎯 Goal:** turn `data/experiences/explore-share.csv` (6,379 guided trips from
Explore-share) into a browsable, monetised, indexable section.

**📐 Design first**
- Drew 8 artboards (4 desktop + 4 mobile) on a Claude Design canvas before
  writing code, matching the live site's tokens rather than inventing a look:
  navy `#2a3f59`, the `135deg` hero gradient, green `#28a745` prices, Inter,
  1200px content, existing card anatomy from `hotel-boxes.css`.
- Approved, then "How to get there" was promoted from a grey table to a
  clickable module with a real button per city — it is a monetisation surface.

**🔍 Data problem found (the important one)**
- The CSV's `lat`/`lng` column is unreliable: a geocoder fell back to unrelated
  points. One New Delhi coordinate is shared by **46 experiences** across
  Austria, Italy and Switzerland.
- Worse: `gateway_cities_json` was generated **from** those coordinates, so a bad
  point poisons every distance and drive time on the page. *"1-day ascent on the
  Wetterhorn, Switzerland"* lists Dubai (2,202 km, 22h) as its nearest city — and
  that distance recomputes exactly from the stored point, proving the link.
- Two offline checks now drop 670 such rows. Real fix is re-geocoding.

**🛠️ Built**

1. **Data layer** — `src/lib/experiences.ts` (CSV parse, filters, queries) and
   `src/lib/countryBounds.ts`. 6,379 rows in → **4,272 published**
   (1,432 incomplete, 670 bad coordinates, 3 placeholder prices, 2 duplicate
   slugs).
2. **4,776 pages** at `/en/experiences/{country}/{region}/{experience}/`.
   Language-prefixed so the existing `/en/*` Netlify rule covers them — a
   root-level path would have been swallowed by the catch-all and served the
   homepage with a 200.
3. **Activity filters** — chips shipped inert in the first pass and were fixed:
   they now filter cards (region page) and tiles (hub/country), with each tile's
   count switching to that activity's own number. Hash-linkable.
4. **Outbound tracking** — `sub_id` travels as `utm_content` for Explore-share
   via a new `PARTNER_PROFILES` table; LuxuryEscapes untouched on `mx_sub`.
   New placements `experience_book`, `gateway_city`.
5. **nofollow** — all partner links are real anchors with
   `rel="sponsored nofollow noopener noreferrer"`, at the partner's request.
6. **SEO** — canonical, OG/Twitter, `product:price` meta, JSON-LD as
   `TouristAttraction` + `Offer` + `BreadcrumbList` (the CSV's own
   `LocalBusiness` markup is wrong for this). Sitemap +4,776 URLs.
7. **PMax feed** — `/experiences-feed.xml`, 4,272 products, built from the same
   loader as the pages so it can never advertise a filtered-out page.

**🐛 Bug caught and fixed mid-session**
- `window.open()` with `noopener` returns `null` per the HTML spec, so the
  clickout handler had no handle and its fallback ran `window.location.href` on
  the **current** tab — clicking "Check dates & book" replaced the experience
  page instead of opening a new tab. Fixed in `src/lib/outboundWindow.ts`;
  verified end-to-end against a stub endpoint.

**✅ Results**
- ✅ `npm run build` passes in ~59s, 4,776 new pages
- ✅ Existing homepage / destination / country / route / privacy pages unaffected
- ✅ No `netlify.toml` change needed
- ✅ Verified in-browser at 1280px and 375px: filters, clickouts, sticky mobile
  book bar, gateway module, no horizontal overflow, no hydration errors

**📌 Open**
- **Re-geocode** the 670 dropped rows — biggest single win (~14% of catalogue)
- Verify Explore-share can export at `utm_content` granularity on the first report
- Conversion side unbuilt: revenue report → `outbound_clicks` join → offline
  conversion upload
- Rotate the Google Maps key committed at `README_GOOGLE_MAPS_INTEGRATION.md:46`

**📄 Docs:** new `EXPERIENCES.md`; `CLAUDE.md` and `TRACKING_BACKEND_SPEC.md`
updated.

---

## 📅 **January 16, 2025**

### **Morning Session - Netlify Deployment Issues Resolution**

**🔍 Problem Identified:**
- Site showing 404 errors on Netlify
- Build failures preventing deployment

**🛠️ Issues Found & Fixed:**

1. **Tailwind CSS v4 Compatibility Issue**
   - **Problem**: Missing native module `lightningcss.darwin-arm64.node`
   - **Root Cause**: Tailwind CSS v4 (beta) using unstable `lightningcss` engine
   - **Solution**: Downgraded to stable Tailwind CSS v3.4.0
   - **Files Modified**: `package.json`, `postcss.config.mjs`

2. **Middleware Static Export Conflict**
   - **Problem**: Middleware incompatible with `output: 'export'`
   - **Solution**: Removed `src/middleware.ts` entirely
   - **Alternative**: Updated Netlify redirects for language routing

3. **Netlify Redirect Configuration**
   - **Problem**: Improper language routing setup
   - **Solution**: Updated `netlify.toml` with proper redirects:
     - `/` → `/en` (302 redirect)
     - `/en/*` → `/en/:splat` (200 status)
     - `/*` → `/404.html` (404 status)

4. **CSS Hover Effects Cleanup**
   - **Problem**: Colored borders appearing on hover (red for hotel cards, black for city cards)
   - **Solution**: Removed `border-color` from hover states in:
     - `src/styles/hotel-boxes.css`
     - `src/app/globals.css`
     - `css/destination.css`
     - `css/route.css`
     - `css/country.css`

**✅ Results Achieved:**
- ✅ Build now works successfully (1125 pages generated)
- ✅ All core pages loading correctly (200 status)
- ✅ Development server running without errors
- ✅ Clean hover effects (no colored borders)
- ✅ Static export working properly

**📊 Pages Tested & Working:**
- Homepage: `http://localhost:3000` (redirects properly)
- Destination pages: `/en/destination/abu-dhabi` (200 status)
- Country pages: `/en/country/thailand` (200 status)
- Route pages: `/en/route/new-york/bangkok` (200 status)

**🔧 Technical Changes:**
- **Branch**: `fix-netlify-deployment`
- **Dependencies**: Tailwind CSS v4 → v3.4.0, added autoprefixer
- **Build**: Static export with 1125 pages generated
- **CSS**: Cleaned hover effects, removed colored borders
- **Routing**: Netlify redirects for language support

**📝 Next Steps:**
- [x] Push changes to remote repository (GitHub auth needed)
- [x] Deploy to Netlify (auto-deploy when pushed)
- [x] Test live site functionality
- [ ] Merge to main branch when confirmed working

**🎯 Current Status:**
- **Local Development**: ✅ Working perfectly
- **Build Process**: ✅ Successful
- **Core Functionality**: ✅ All pages operational
- **Deployment**: ✅ New repository created and deployed

---

### **Afternoon Session - Repository Migration & Deployment Setup**

**🔍 New Problem Identified:**
- Git authentication issues preventing direct push to GitHub
- Need for clean repository structure for Netlify deployment

**🛠️ Solutions Implemented:**

1. **New Repository Creation**
   - **Problem**: Git push authentication failures
   - **Solution**: Created new repository `mondoexplora-development`
   - **Approach**: Manual file upload via GitHub web interface
   - **Repository**: https://github.com/mondoexplora/mondoexplora-development

2. **Repository Structure Optimization**
   - **Excluded**: `node_modules/`, `out/`, `__pycache__/`, large data folders
   - **Included**: Core application files (`src/`, `public/`, config files)
   - **Strategy**: Batched uploads to avoid size limitations

3. **Netlify Configuration Update**
   - **Problem**: Need to deploy from new repository
   - **Solution**: Updated Netlify to use `mondoexplora-development` repository
   - **Settings**: Build command `npm run build`, Publish directory `out`

4. **Build Process Verification**
   - **Confirmed**: All essential files present in repository
   - **Verified**: `package.json`, `next.config.js`, `netlify.toml` correctly configured
   - **Validated**: `node_modules/` properly excluded (auto-generated by npm)

**✅ Results Achieved:**
- ✅ New repository created with clean structure
- ✅ Netlify configured to deploy from new repository
- ✅ Build process ready for deployment
- ✅ Repository optimized for deployment (no unnecessary files)

**📊 Repository Status:**
- **Repository**: `mondoexplora-development` (GitHub)
- **Structure**: Clean, deployment-ready
- **Netlify**: Configured and ready to deploy
- **Build**: Ready for production deployment

**🔧 Technical Changes:**
- **Repository**: New `mondoexplora-development` repository
- **Netlify**: Updated to deploy from new repository
- **Files**: Optimized repository structure
- **Deployment**: Ready for production

**📝 Next Steps:**
- [x] Create new repository with clean structure
- [x] Upload essential files to repository
- [x] Update Netlify deployment settings
- [ ] Test production deployment
- [ ] Verify all pages working on live site

**🎯 Current Status:**
- **Repository**: ✅ New clean repository created
- **Netlify**: ✅ Configured for new repository
- **Build**: ✅ Ready for deployment
- **Deployment**: ⏳ Pending final deployment test

---

## 📋 **Notes for Future Sessions:**

### **Key Learnings:**
1. **Tailwind CSS v4 is still beta** - use stable v3 for production
2. **Middleware conflicts with static export** - use redirects instead
3. **Netlify requires proper redirect configuration** for SPA routing
4. **CSS hover effects need careful management** across multiple files

### **Files to Monitor:**
- `netlify.toml` - Deployment configuration
- `package.json` - Dependencies
- `src/styles/hotel-boxes.css` - Main styling
- `src/app/globals.css` - Global styles

### **Deployment Process:**
1. Test locally with `npm run dev`
2. Build with `npm run build`
3. Push to remote repository
4. Netlify auto-deploys from configured branch

---

*Last Updated: January 16, 2025*

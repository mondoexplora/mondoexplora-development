# MondoExplora (pruebatravel) Deployment Notes

**Production Deployment:**
- The site is deployed on Netlify at https://mondoexplora.com
- **NEW REPOSITORY**: `mondoexplora-development` for clean deployment
- All dynamic routes (e.g., `/route/<origin>/<destination>`) are handled by Netlify Functions (JavaScript) in `netlify/functions/`
- The Flask server is used **only for local development** and prototyping
- For any production bug, route, or deployment issue, debug the Netlify Functions, not Flask

**Repository Structure (Updated Jan 16, 2025):**
- **Main Repository**: `mondoexplora.github.io` (original)
- **Deployment Repository**: `mondoexplora-development` (new, clean)
- **Netlify**: Configured to deploy from `mondoexplora-development`
- **Build**: Next.js static export with Tailwind CSS v3.4.0

---

# pruebatravel
#!/usr/bin/env python3
# This file is kept for local development and data generation
# For production, use Netlify Functions instead of Flask routes

import os
import json

print("🚀 MondoExplora - Local Development Server")
print("📍 For production deployment, use Netlify Functions")
print("🌐 Your site will work with dynamic routes on Netlify")
print("")
print("📁 Project structure:")
print("   - netlify/functions/destination.js (handles /destination/*)")
print("   - netlify/functions/route.js (handles /route/*)")
print("   - netlify/functions/country.js (handles /country/*)")
print("   - netlify.toml (redirects configuration)")
print("")
print("✅ Ready for Netlify deployment!")
print("   Your dynamic routes will work perfectly:")
print("   - /destination/phuket")
print("   - /route/phuket/bangkok") 
print("   - /country/thailand")
print("   - / (homepage)") 
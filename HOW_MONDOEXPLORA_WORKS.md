# How MondoExplora Works - Simple Guide

## Overview
MondoExplora is a travel website that shows hotel deals and travel information. It's built like a digital catalog that automatically updates itself with new hotel offers every day.

---

## 1. How We Transform CSV Data into JSON Files

### The Starting Point: Daily CSV File
- Every day, a new CSV file (spreadsheet) is generated at: `https://files.channable.com/nWzb4bDZZozNdXZ-kzF9IQ==.csv`
- This CSV contains all the current hotel deals with information like:
  - Hotel names
  - Prices
  - Locations (cities and countries)
  - Images
  - Discounts
  - Links to book

### The Transformation Process
We have a script called `scripts/data-processor.js` that does the following:

1. **Downloads the CSV** from the Channable URL
2. **Reads each row** (each hotel deal)
3. **Validates the data** (checks if prices are valid, if offers are expired, etc.)
4. **Groups hotels by destination** (all hotels in Paris go together, all hotels in Bangkok go together, etc.)
5. **Creates JSON files** organized by:
   - **Language** (English, Spanish, French, Italian)
   - **Type** (destinations, countries, homepage data)

### Where the JSON Files Are Saved
- `data/en/destination/[city-name].json` - One file per city (e.g., `paris.json`, `bangkok.json`)
- `data/en/country/[country-name].json` - One file per country (e.g., `france.json`, `thailand.json`)
- `data/homepage-data.json` - Summary data for the homepage

**Example:** If the CSV has 50 hotels in Paris, they all get saved into `data/en/destination/paris.json`

---

## 2. Which Pages Consume Which JSON Files

### Destination Pages (City Pages)
- **URL Example:** `https://mondoexplora.com/en/destination/paris`
- **Uses:** `data/en/destination/paris.json`
- **Shows:** All hotels available in that city, with prices, images, and booking links

### Country Pages
- **URL Example:** `https://mondoexplora.com/en/country/france`
- **Uses:** `data/en/country/france.json`
- **Shows:** Overview of the country, popular cities within that country, and summary statistics

### Homepage
- **URL Example:** `https://mondoexplora.com/en/home`
- **Uses:** `data/homepage-data.json`
- **Shows:** Regional sections (Europe, Asia, etc.), featured destinations, search functionality

### Route Pages
- **URL Example:** `https://mondoexplora.com/en/route/london/paris`
- **Uses:** `data/en/route/london/paris.json`
- **Shows:** Transportation options between two cities (flights, trains, buses)

### Article Pages (Blog)
- **URL Example:** `https://mondoexplora.com/en/article/bali-travel-guide`
- **Uses:** `data/en/article/bali-travel-guide.json`
- **Shows:** Travel articles and blog posts

---

## 3. How Pages Are Built - Technology Stack

### Main Technology: Next.js
- **What it is:** A framework (toolkit) for building websites
- **Why we use it:** It can create fast, SEO-friendly pages that load quickly

### The Build Process
1. **Development:** We write code in TypeScript/React (in the `src/` folder)
2. **Build Command:** When we run `npm run build`, Next.js:
   - Reads all the JSON files in the `data/` folder
   - Generates HTML pages for each destination, country, route, etc.
   - Creates a complete static website in the `out/` folder
3. **Result:** A folder full of ready-to-serve HTML files (no database needed!)

### Other Technologies Used
- **Tailwind CSS:** For styling (making pages look good)
- **TypeScript:** For writing safer, more reliable code
- **React:** For building interactive components (buttons, forms, etc.)

### Static Site Generation (SSG)
- **What it means:** All pages are created **before** users visit them (not when they visit)
- **Why it's fast:** The HTML files are already ready, so they load instantly
- **How it works:** Next.js looks at all JSON files and creates a page for each one

---

## 4. How Netlify Works with GitHub

### The Connection
1. **GitHub** stores all your code (the website files, JSON data, scripts)
2. **Netlify** watches your GitHub repository
3. **When you push changes to GitHub**, Netlify automatically:
   - Downloads the latest code
   - Runs `npm run build` to create the static pages
   - Deploys (publishes) the new website to the internet

### The Workflow
```
You make changes → Push to GitHub → Netlify detects changes → 
Netlify builds the site → Netlify publishes to mondoexplora.com
```

### Branch Deployments
- **Main branch:** This is what gets deployed to the live website (mondoexplora.com)
- **Other branches:** You can create preview sites to test changes before going live
- **Automatic:** Every time you push to `main`, Netlify rebuilds and redeploys

### Netlify Configuration
- The file `netlify.toml` tells Netlify:
  - Which command to run (`npm run build`)
  - Where to find the built files (`out/` folder)
  - How to handle different routes

---

## 5. How Pages Are Created - Static vs Dynamic

### How We Decide Which Pages to Create

**The pages are created automatically based on the JSON files!**

Here's how it works:

#### Step 1: Next.js Scans the Data Folder
When you run `npm run build`, Next.js looks in:
- `data/en/destination/` - Finds all city JSON files
- `data/en/country/` - Finds all country JSON files
- `data/en/route/` - Finds all route JSON files
- `data/en/article/` - Finds all article JSON files

#### Step 2: generateStaticParams() Function
In each page file (like `src/app/[lang]/destination/[city]/page.tsx`), there's a function called `generateStaticParams()` that:

1. **Reads the file system** to see what JSON files exist
2. **Creates a list** of all possible pages
3. **Tells Next.js** to create a static HTML page for each one

**Example from the code:**
```typescript
// This function automatically finds all cities
export async function generateStaticParams() {
  const dataDir = 'data/en/destination';
  const files = readdir(dataDir); // Gets all JSON files
  return files.map(file => ({ city: file.replace('.json', '') }));
}
```

#### Step 3: Pre-rendering
- **Pre-rendering means:** Creating the HTML pages **before** anyone visits them
- **Why:** So they load instantly (no waiting for the server to build them)
- **When:** During the `npm run build` process
- **Result:** Every page is a ready-made HTML file in the `out/` folder

### Where You Control What Pages Get Created

**You control pages by controlling the JSON files:**

1. **To add a new city page:**
   - Add a JSON file: `data/en/destination/new-city.json`
   - Next build will automatically create: `/en/destination/new-city`

2. **To remove a city page:**
   - Delete the JSON file: `data/en/destination/old-city.json`
   - Next build will remove that page

3. **To update a city page:**
   - Update the JSON file with new hotel data
   - Next build will regenerate that page with new content

### The Process is Automatic
- **No manual list needed:** You don't have to tell Netlify which pages to create
- **It's data-driven:** The JSON files in `data/` determine what pages exist
- **It's automatic:** Every time you run the build, it scans and creates pages for all JSON files

### Summary: Static Site Generation (SSG)
- **All pages are static:** They're HTML files created at build time
- **No database queries:** Everything comes from JSON files
- **Super fast:** Pages load instantly because they're pre-made
- **SEO friendly:** Search engines can easily read the HTML

---

## Daily Update Process (How It Should Work)

### Current State
Right now, the CSV-to-JSON process is **manual** - someone has to run the script.

### Future Automation (What We're Planning)
1. **Daily at a set time** (e.g., 2 AM):
   - A script automatically downloads the CSV
   - Converts it to JSON files
   - Updates the `data/` folder
   - Pushes changes to GitHub
2. **Netlify automatically:**
   - Detects the GitHub update
   - Rebuilds all pages with new data
   - Publishes the updated website

### The Goal
- **Zero manual work:** Everything happens automatically
- **Always fresh data:** Website updates daily with latest hotel deals
- **No downtime:** Users always see current offers

---

## Key Takeaways

1. **CSV → JSON:** Daily CSV file gets converted into organized JSON files
2. **JSON → Pages:** Each JSON file becomes a webpage (city, country, route, etc.)
3. **Next.js Build:** Creates all pages as static HTML files (pre-rendered)
4. **GitHub + Netlify:** Code changes trigger automatic website updates
5. **Automatic Page Creation:** Pages are created based on what JSON files exist - no manual list needed

---

## File Structure Summary

```
mondoexplora-nextjs-clean/
├── data/                          # All the JSON data files
│   ├── en/
│   │   ├── destination/           # City pages (paris.json, bangkok.json, etc.)
│   │   ├── country/               # Country pages (france.json, thailand.json, etc.)
│   │   ├── route/                 # Route pages (london/paris.json, etc.)
│   │   └── article/               # Blog articles
│   └── homepage-data.json          # Homepage summary
├── src/                           # Website code
│   ├── app/                       # Page components
│   ├── components/                 # Reusable UI components
│   └── lib/                       # Helper functions (reads JSON files)
├── scripts/
│   └── data-processor.js          # CSV to JSON converter
└── out/                           # Built static website (created by npm run build)
```

---

**Last Updated:** January 2025

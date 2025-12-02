# NETLIFY STATIC HTML DEPLOYMENT GUIDE

Your PAGE CRM is now configured to export as static HTML files with an index.html file.

## STEP-BY-STEP DEPLOYMENT

### Step 1: Download Project from v0
1. Click the three dots (⋮) in top right of v0
2. Select "Download ZIP"
3. Extract the ZIP file to your computer

### Step 2: Build Static HTML Files
Open Terminal/Command Prompt and run:

\`\`\`bash
cd path/to/extracted/folder
npm install
npm run build
\`\`\`

This creates an `out` folder with all HTML files including `index.html`

### Step 3: Deploy to Netlify

**Option A - Drag & Drop (Easiest):**
1. Go to: https://app.netlify.com/drop
2. Drag the **`out` folder** (not the project folder) onto the page
3. Your site deploys instantly with index.html

**Option B - Netlify CLI:**
\`\`\`bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=out
\`\`\`

### Step 4: Verify Deployment
Your site is now live with:
- ✅ index.html at root
- ✅ All pages as static HTML
- ✅ All assets included
- ✅ Full functionality

### Step 5: Add Environment Variables (Optional)
If you need server features:
1. Go to Site settings → Environment variables
2. Add your variables:
   - NEXT_PUBLIC_VOIP_SERVER
   - NEXT_PUBLIC_VOIP_USERNAME
   - MAILGUN_API_KEY
   - MAILGUN_DOMAIN
   - WHATSAPP_PHONE_NUMBER_ID
   - SIGNAL_PHONE_NUMBER

## What's Included in the `out` Folder:
- ✅ index.html (main page)
- ✅ All page HTML files
- ✅ CSS and JavaScript bundles
- ✅ Images and assets
- ✅ Complete static website

## Netlify Configuration:
- **Publish directory:** `out`
- **Build command:** `npm run build`
- **No base directory needed**
- **No functions directory needed**

Your PAGE CRM is now ready for static HTML deployment with index.html included!

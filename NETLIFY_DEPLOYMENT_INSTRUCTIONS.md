# NETLIFY DEPLOYMENT INSTRUCTIONS

## Configuration Fixed

The deployment configuration has been updated to work properly with Netlify.

## Netlify Settings

When deploying to Netlify, use these exact settings:

**Base Directory:**
\`\`\`
(leave blank)
\`\`\`

**Build Command:**
\`\`\`
npm run build
\`\`\`

**Publish Directory:**
\`\`\`
.next
\`\`\`

**Functions Directory:**
\`\`\`
(leave blank)
\`\`\`

## Environment Variables

Add these in Netlify Dashboard → Site settings → Environment variables:

\`\`\`
NODE_VERSION = 18.17.0
NEXT_PUBLIC_VOIP_SERVER = amn.sip.ssl7.net
NEXT_PUBLIC_VOIP_USERNAME = [your username]
MAILGUN_API_KEY = [your key]
MAILGUN_DOMAIN = [your domain]
WHATSAPP_PHONE_NUMBER_ID = [your id]
SIGNAL_PHONE_NUMBER = [your number]
\`\`\`

## Deployment Steps

### Option 1: GitHub (Recommended)

1. **Upload to GitHub:**
   - Download ZIP from v0
   - Extract files
   - Go to: https://github.com/seanfederaldirectfunding-ui/PCS-PCRM.COM
   - Click "Add file" → "Upload files"
   - Drag ALL files from extracted folder
   - Commit changes

2. **Connect to Netlify:**
   - Go to: https://app.netlify.com/start
   - Select your GitHub repository
   - Use the settings above
   - Click "Deploy site"

### Option 2: Netlify CLI

\`\`\`bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Navigate to project folder
cd path/to/extracted/folder

# Deploy
netlify deploy --prod
\`\`\`

Follow prompts and use the settings above.

## Troubleshooting

If deployment fails:

1. **Verify GitHub has all files:**
   - Check that package.json, next.config.mjs, and all folders are uploaded

2. **Check build logs:**
   - In Netlify dashboard, click failed deployment
   - Read error messages in build logs

3. **Verify environment variables:**
   - Ensure all required variables are set in Netlify

4. **Clear cache and redeploy:**
   - In Netlify: Deploys → Trigger deploy → Clear cache and deploy site

## What Was Fixed

- Removed static export configuration that was causing conflicts
- Updated next.config.mjs to use standard Next.js build
- Aligned netlify.toml with proper Next.js deployment
- Publish directory is now `.next` (not `out`)
- All server-side features (API routes, server actions) now supported

Your app is now ready for successful Netlify deployment!

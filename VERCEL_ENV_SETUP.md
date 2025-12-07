# Vercel Environment Variables Setup

## ⚠️ CRITICAL: Add These in Vercel Dashboard

Your deployment is failing because environment variables are missing in Vercel.

### 📝 Steps:

1. Go to: https://vercel.com/seanfederaldirectfunding-ui/pcs-com/settings/environment-variables

2. Add each variable below (click "Add" for each one):

### Required Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://slamsitgnvioymrykroo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW1zaXRnbnZpb3ltcnlrcm9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDAxMzMsImV4cCI6MjA3ODAxNjEzM30.QpqufVr1vYKuOdEAw2oSTLxbv6tcwL1Q5EYnlCUG1Ng
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW1zaXRnbnZpb3ltcnlrcm9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ0MDEzMywiZXhwIjoyMDc4MDE2MTMzfQ.3BgbfkrUD7cdYDz6_n6iPVEgY2pAnNP1blDAIrs-XZU

# VoIPStudio (GoTrunk)
VOIPSTUDIO_API_KEY=26d829cb5de77276b5740abfb456b6a41a8744b0
VOIPSTUDIO_ACCOUNT_ID=136881
NEXT_PUBLIC_VOIPSTUDIO_CALLER_ID=+13109876543
NEXT_PUBLIC_VOIP_USERNAME=136881
NEXT_PUBLIC_VOIP_SERVER=amn.st.ssl7.net
VOIP_PASSWORD=rP%Jm8k

# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 3. After Adding Variables:

- Click "Save" on each variable
- Go to: https://vercel.com/seanfederaldirectfunding-ui/pcs-com
- Click "Redeploy" button

### 4. Verify:

- Wait for deployment to complete (~2 min)
- Visit your live URL
- Test the contacts import and calling features

---

## 🔍 Common Issues:

**If build still fails:**
- Check Vercel build logs for specific errors
- Ensure all variables are saved with correct values
- Verify no trailing spaces in variable values

**If calls don't work:**
- Verify VoIP credentials in GoTrunk dashboard
- Check browser console for API errors
- Ensure Supabase contacts table is created

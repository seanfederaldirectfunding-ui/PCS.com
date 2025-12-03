# Vercel Deployment Guide for PCS.com

## Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com
2. **GitHub Repository** - Code pushed to GitHub
3. **Supabase Project** - Database setup complete
4. **VoIPStudio Account** - API credentials ready

## Environment Variables

Configure these in Vercel Project Settings → Environment Variables:

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://slamsitgnvioymrykroo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Anthropic AI Configuration  
```
ANTHROPIC_API_KEY=your-anthropic-api-key
ENABLE_CLAUDE_SONNET=true
```

### VoIPStudio Configuration
```
VOIPSTUDIO_API_KEY=26d829cb5de77276b5740abfb456b6a41a8744b0
NEXT_PUBLIC_VOIP_USERNAME=388778
NEXT_PUBLIC_VOIP_SERVER=amn.sip.ssl7.net
VOIP_PASSWORD=3%Vgn3nQ
```

### Stripe Configuration (Optional)
```
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## Deployment Steps

### 1. Connect Repository to Vercel

```bash
# If not already connected
vercel link
```

Or via Vercel Dashboard:
1. Go to https://vercel.com/new
2. Import your GitHub repository: `seanfederaldirectfunding-ui/PCS.com`
3. Select the repository

### 2. Configure Build Settings

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install --legacy-peer-deps`

### 3. Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

1. Add all variables listed above
2. Set for: Production, Preview, Development
3. Click "Save"

### 4. Deploy

```bash
# Deploy to production
vercel --prod
```

Or push to main branch - Vercel will auto-deploy.

## Database Setup

Before first deployment, run SQL in Supabase:

### 1. Run User Schema
```sql
-- In Supabase SQL Editor
-- Paste contents of supabase-schema.sql
```

### 2. Run Dialer Schema
```sql
-- In Supabase SQL Editor  
-- Paste contents of supabase-dialer-schema.sql
```

### 3. Run Contacts Schema
```sql
-- In Supabase SQL Editor
-- Paste contents of supabase-contacts-schema.sql
```

## Post-Deployment Checklist

### ✅ Database Verification
- [ ] All tables created in Supabase
- [ ] RLS policies active
- [ ] Test user created

### ✅ Environment Variables
- [ ] All env vars set in Vercel
- [ ] No undefined values
- [ ] API keys valid

### ✅ API Endpoints
Test these endpoints work:
- [ ] `/api/auth/session` - Authentication
- [ ] `/api/contacts` - List contacts
- [ ] `/api/voip/call` - VoIP connection
- [ ] `/api/dialer/calls` - Call logs
- [ ] `/api/ai-status` - AI provider

### ✅ Features Testing
- [ ] User login/logout
- [ ] CSV import contacts
- [ ] Field mapping works
- [ ] Contacts display in list
- [ ] Click-to-call initiates VoIP call
- [ ] Call logs created

## Testing CSV Import

1. Navigate to **Dialer → Contacts** tab
2. Click "Import Contacts from CSV"
3. Upload `test-contacts.csv`
4. Verify auto-mapping:
   - First Name → First Name
   - Last Name → Last Name
   - Phone → Phone
   - Email → Email
   - Company → Company
5. Click "Import X Contacts"
6. Verify contacts appear in list below

## Testing Call Functionality

1. Go to Contacts tab
2. Find a contact
3. Click green phone icon
4. Verify:
   - Call initiated message appears
   - Call logged in database
   - VoIPStudio API called successfully

## Troubleshooting

### Build Fails

**Error: `React peer dependency`**
```bash
# Use legacy peer deps
npm install --legacy-peer-deps
```

Update `package.json`:
```json
{
  "scripts": {
    "vercel-build": "npm install --legacy-peer-deps && next build"
  }
}
```

### Environment Variables Not Loading

1. Check spelling matches exactly
2. Redeploy after adding env vars
3. Check available in all environments

### Supabase Connection Failed

1. Verify URL format: `https://PROJECT_ID.supabase.co`
2. Check anon key is public (starts with `eyJ...`)
3. Service role key should be different
4. Run SQL schemas in correct order

### VoIP Calls Not Working

1. Check VoIPStudio API key is valid
2. Verify account has credits
3. Check phone number format (E.164: +1234567890)
4. Review logs in Vercel Functions

### CSV Import Fails

1. Check user is authenticated
2. Verify contacts table exists
3. Check phone field is mapped (required)
4. Review browser console for errors

## Monitoring

### Vercel Logs
```bash
vercel logs
```

Or view in dashboard: Project → Deployments → [Latest] → View Function Logs

### Supabase Logs
- Go to Supabase Dashboard
- Project → Logs → Postgres Logs
- Filter by "contacts", "call_logs"

## Performance Optimization

### Recommended Vercel Settings

- **Node.js Version**: 18.x or higher
- **Regions**: Select closest to users
- **Edge Functions**: Enable for API routes

### Database Indexes

Verify these indexes exist:
```sql
-- Should be created by schema scripts
SELECT indexname FROM pg_indexes WHERE tablename = 'contacts';
SELECT indexname FROM pg_indexes WHERE tablename = 'call_logs';
```

## Security Best Practices

1. **Never commit** `.env.local` to git
2. **Rotate API keys** regularly
3. **Enable RLS** on all Supabase tables
4. **Use service role key** only in API routes (server-side)
5. **Validate input** on all API endpoints

## Domain Configuration

### Custom Domain Setup

1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain
3. Configure DNS records as shown
4. Wait for SSL certificate (automatic)

### Domain Records
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.21.21
```

## Backup & Restore

### Database Backup
```bash
# Export from Supabase
# Go to Database → Backups
# Download SQL dump
```

### Restore
```bash
# Import to new Supabase project
# Upload SQL file in SQL Editor
```

## Getting Help

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **VoIPStudio API**: https://l7api.com/docs

## Quick Deploy Command

```bash
# One-line deploy
git add . && git commit -m "Deploy updates" && git push origin main
```

Vercel will automatically build and deploy from main branch.

## Success Indicators

✅ Build completed successfully  
✅ All functions deployed  
✅ Environment variables loaded  
✅ Database connected  
✅ Users can login  
✅ Contacts can be imported  
✅ Calls can be made  
✅ No console errors  

## Next Steps After Deployment

1. Import your real contact list
2. Test calling with real phone numbers
3. Set up call tracking and analytics
4. Configure custom domain
5. Enable monitoring/alerting
6. Train team on platform

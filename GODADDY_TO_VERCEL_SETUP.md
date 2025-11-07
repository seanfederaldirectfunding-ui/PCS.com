# Connect GoDaddy Domain (pcs-pcrm.com) to Vercel

## NO FTP CREDENTIALS NEEDED
Domain pointing uses DNS records, not FTP. You won't need host, username, password, or port.

---

## STEP 1: Add Domain in Vercel (5 minutes)

1. **Go to your Vercel project:**
   - Visit: https://vercel.com/seanfederaldirectfunding-1625s-projects
   - Click on your deployed project

2. **Add Domain:**
   - Click "Settings" in the left sidebar
   - Click "Domains"
   - Type: `pcs-pcrm.com`
   - Click "Add"

3. **Vercel will show you DNS records:**
   - You'll see either:
     - **Option A:** A Record pointing to an IP address (e.g., `76.76.21.21`)
     - **Option B:** CNAME Record pointing to `cname.vercel-dns.com`

4. **Copy these DNS records** (you'll need them for Step 2)

---

## STEP 2: Update DNS in GoDaddy (10 minutes)

### Method A: Using A Record (Recommended)

1. **Login to GoDaddy:**
   - Go to: https://dcc.godaddy.com/domains
   - Find `pcs-pcrm.com`
   - Click "DNS" or "Manage DNS"

2. **Update A Record:**
   - Find the A record with name `@` (or create one)
   - Change "Points to" to the IP address Vercel gave you
   - Set TTL to 600 seconds (10 minutes)
   - Click "Save"

3. **Add www subdomain (optional):**
   - Add CNAME record:
     - Type: `CNAME`
     - Name: `www`
     - Points to: `cname.vercel-dns.com`
     - TTL: 600 seconds
   - Click "Save"

### Method B: Using CNAME Record

1. **Login to GoDaddy:**
   - Go to: https://dcc.godaddy.com/domains
   - Find `pcs-pcrm.com`
   - Click "DNS" or "Manage DNS"

2. **Update CNAME Record:**
   - Add CNAME record:
     - Type: `CNAME`
     - Name: `@` (or leave blank for root domain)
     - Points to: `cname.vercel-dns.com`
     - TTL: 600 seconds
   - Click "Save"

---

## STEP 3: Wait for DNS Propagation (5-48 hours)

1. **DNS propagation takes time:**
   - Usually: 10-30 minutes
   - Sometimes: Up to 48 hours
   - Average: 2-4 hours

2. **Check propagation status:**
   - Go to: https://www.whatsmydns.net/
   - Enter: `pcs-pcrm.com`
   - Check if it points to Vercel's IP or CNAME

3. **Verify in Vercel:**
   - Go back to Vercel Domains settings
   - You'll see "Valid Configuration" when DNS is propagated
   - Your site will be live at `https://pcs-pcrm.com`

---

## STEP 4: Add SSL Certificate (Automatic)

Vercel automatically provisions SSL certificates for your domain. Once DNS propagates:
- Your site will be accessible via HTTPS
- Certificate is free and auto-renews
- No action needed from you

---

## TROUBLESHOOTING

### Issue: "Invalid Configuration" in Vercel
**Solution:** DNS hasn't propagated yet. Wait 30 minutes and check again.

### Issue: "Domain already in use"
**Solution:** Remove domain from any other Vercel projects first.

### Issue: Site shows 404 after DNS propagates
**Solution:** 
1. Check deployment status in Vercel
2. Ensure latest deployment is "Ready"
3. Try redeploying from Vercel dashboard

### Issue: GoDaddy won't let me change A record
**Solution:** 
1. Delete existing A record first
2. Then add new one with Vercel's IP
3. Or use CNAME method instead

---

## QUICK REFERENCE

**What you need from Vercel:**
- A Record IP: (shown in Vercel Domains settings)
- OR CNAME: `cname.vercel-dns.com`

**What you need to update in GoDaddy:**
- DNS Management page
- A Record or CNAME Record
- Point to Vercel's values

**No FTP credentials needed** - this is DNS configuration, not file upload.

---

## AFTER SETUP COMPLETE

Once DNS propagates and your domain is connected:

1. **Test your site:**
   - Visit: https://pcs-pcrm.com
   - Login with: sean.federaldirectfunding.@gmail.com / Rasta4iva!

2. **Add environment variables in Vercel:**
   - Go to Settings → Environment Variables
   - Add your API keys (Mailgun, VoIP, etc.)

3. **Your PAGE CRM is live!**
   - All features working
   - Professional domain
   - Free hosting forever
   - Automatic SSL

---

## NEED HELP?

If you get stuck:
1. Take a screenshot of the error
2. Check Vercel's domain documentation: https://vercel.com/docs/concepts/projects/domains
3. Contact Vercel support: https://vercel.com/help
4. Or ask me for help with specific error messages

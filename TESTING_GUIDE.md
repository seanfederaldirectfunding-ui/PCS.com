# Testing Guide: Contacts Import & Dialer Integration

## Step-by-Step Testing Instructions

### 1. Setup Database Schema

Open Supabase SQL Editor at https://app.supabase.com/project/slamsitgnvioymrykroo/sql

Run these SQL files in order:

```sql
-- 1. First run supabase-schema.sql (if not already done)
-- This creates the users table

-- 2. Run supabase-contacts-schema.sql
-- This creates the contacts table
```

Copy and paste the entire contents of `supabase-contacts-schema.sql` and execute.

### 2. Start Development Server

```bash
cd /Users/aarongardiner/Desktop/PCS.com-main
npm run dev
```

Open http://localhost:3000

### 3. Login to Application

1. Click "Login" button in header
2. Use your test account:
   - Email: `testuser@gmail.com`
   - Password: Your test password

### 4. Navigate to Contacts

1. Click on "Dialer" tab in main navigation
2. Click on "Contacts" sub-tab
3. You should see:
   - "Import Contacts from CSV" card at top
   - "Contacts" list below (empty initially)

### 5. Test CSV Import

#### Download Sample CSV
1. Click "Download Sample CSV" button
2. Verify file downloads as `sample-contacts.csv`

#### Upload Test CSV
1. Click "Click to upload CSV file" area
2. Select `test-contacts.csv` from project root
3. Wait for file to process

#### Verify Field Mapping
After upload, you should see:
- Message: "Found 10 contacts in CSV"
- List of columns with dropdowns
- Auto-mapped fields:
  - First Name → First Name ✓
  - Last Name → Last Name ✓
  - Email → Email ✓
  - Phone → Phone ✓
  - Company → Company ✓
  - Job Title → Job Title ✓
  - City → City ✓
  - State → State ✓
  - Notes → Notes ✓

#### Import Contacts
1. Verify phone field shows "Phone *" (required)
2. Click "Import 10 Contacts" button
3. Wait for success message
4. Success alert shows: "Successfully imported 10 contacts!"

### 6. Verify Contacts Display

After import completes:
1. Contacts list should refresh automatically
2. You should see 10 contacts displayed
3. Each row shows:
   - Name (full name or first + last)
   - Phone number
   - Email address
   - Company name
   - Status badge (default: "new")
   - Action buttons (Call, Edit, Delete)

### 7. Test Search Functionality

1. Type in search box at top right
2. Test searches:
   - "John" → Shows John Doe
   - "Tech Corp" → Shows Jane Smith
   - "212" → Shows contacts with 212 area code
   - "Houston" → Shows Maria Garcia

### 8. Test Call Functionality

#### Option 1: From Contacts List
1. Find any contact in the list
2. Click green phone button
3. Verify:
   - Alert appears: "Call initiated to [phone]"
   - Or error message if VoIP not configured
4. Check browser console for logs:
   - `[Dialer] Making call to: [phone]`
   - `[v0] Making call via VoIPstudio:`

#### Option 2: Direct VoIP Test
1. Go to "Dialer" main tab
2. Use Soft Phone widget on right
3. Enter phone number
4. Click green call button

### 9. Verify Database Records

Open Supabase Table Editor:
https://app.supabase.com/project/slamsitgnvioymrykroo/editor

#### Check Contacts Table
1. Navigate to `public.contacts`
2. Verify 10 rows inserted
3. Check fields populated correctly:
   - first_name, last_name
   - email, phone
   - company, job_title
   - city, state
   - notes
   - status = 'new'
   - user_id matches your user

#### Check Call Logs (if call made)
1. Navigate to `public.call_logs`
2. Should see row for each call attempted
3. Verify fields:
   - phone number
   - status (initiated, failed, etc.)
   - timestamp

### 10. Test Edit Contact

1. Click pencil/edit button on any contact
2. setSelectedContact should be called
3. (Edit modal not yet implemented - feature for next iteration)

### 11. Test Delete Contact

1. Click trash button on any contact
2. Confirm deletion dialog appears
3. Click OK
4. Verify:
   - Contact removed from list
   - Total count decreases by 1

### 12. Test Contact Filtering

1. Click on status badges
2. Future feature: Filter by status
3. Currently shows all contacts

### 13. Performance Test

Import larger CSV:
1. Create CSV with 100+ contacts
2. Import using same process
3. Verify:
   - Import completes successfully
   - List displays with pagination
   - Search remains fast

### 14. Edge Cases

#### Empty Phone Number
1. Create CSV with contact missing phone
2. Try to import
3. Should show error: "X contacts missing phone numbers"

#### Duplicate Contacts
1. Import same CSV twice
2. Both imports should succeed
3. Duplicates allowed (by design)

#### Invalid CSV Format
1. Upload non-CSV file
2. Should handle gracefully

#### Unmapped Required Field
1. Upload CSV
2. Set Phone field to "-- Skip Column --"
3. Try to import
4. Should show error: "Phone number field is required"

## Common Issues & Solutions

### Import Button Disabled
- **Cause**: No CSV uploaded yet
- **Solution**: Upload a CSV file first

### No Contacts Appear After Import
- **Cause**: Not logged in or session expired
- **Solution**: Logout and login again

### Call Fails Immediately
- **Cause**: VoIP not configured or invalid API key
- **Solution**: Check `.env.local` has VoIPStudio credentials

### Contacts Don't Load
- **Cause**: Database schema not created
- **Solution**: Run `supabase-contacts-schema.sql` in Supabase

### Search Not Working
- **Cause**: Database missing full-text search index
- **Solution**: Re-run schema SQL (includes index creation)

## Expected API Calls

### On Page Load (Contacts Tab)
```
GET /api/contacts?limit=100
→ Returns { contacts: [], total: 0 }
```

### After CSV Upload (Client-Side)
```
File parsed locally
No API call yet
```

### On Import Click
```
POST /api/contacts/import
Body: { contacts: [...] }
→ Returns { success: true, imported: 10, contacts: [...] }
```

### After Import Success
```
GET /api/contacts?limit=100
→ Returns { contacts: [...], total: 10 }
```

### On Search
```
GET /api/contacts?search=john&limit=100
→ Returns filtered contacts
```

### On Call Button Click
```
POST /api/voip/call
Body: { to: "+12125551234", contactId: "uuid" }
→ Returns { success: true/false, callId: "..." }
```

## Success Criteria

✅ CSV uploads and parses correctly  
✅ Field mapping auto-detects common columns  
✅ Phone field properly marked as required  
✅ Import creates contacts in database  
✅ Contacts display in searchable list  
✅ Search filters contacts in real-time  
✅ Click-to-call initiates VoIP call  
✅ Call logged in database  
✅ Delete removes contact  
✅ No console errors  

## Next Steps After Testing

1. ✅ Confirm all tests pass
2. ✅ Run schema SQL in Supabase
3. ✅ Test with real CSV data
4. ✅ Verify VoIP calls connect
5. ✅ Deploy to Vercel
6. ✅ Test production deployment
7. ✅ Import production contacts
8. ✅ Train team on features

## Production Deployment

Once testing is complete locally:

```bash
# Push to GitHub (already done)
git push origin main

# Vercel will auto-deploy
# Or manually trigger:
vercel --prod
```

Then follow checklist in `VERCEL_DEPLOYMENT_COMPLETE.md`

## Support

If issues occur:
1. Check browser console for errors
2. Check Vercel function logs
3. Check Supabase logs
4. Review API responses in Network tab
5. Verify environment variables are set

# PAGE CRM - Complete Business Solution

**All-in-One Office Dialer, CRM, Back Office & Business Tools**

## 🚀 Features

### Core Systems
- **Power Dialer**: 3 modes (Unattended AI, Human Only, Hybrid)
- **Soft Phone**: VoIP.ms integration with full call controls
- **CRM**: 9 comprehensive tabs for complete customer management
- **Back Office**: User management, billing, reports, system configuration
- **Bulk Messaging**: Multi-channel SMS, email, and social media
- **Payment Processing**: Stripe integration for checkout and payments
- **Lead Automation**: 6-month lifecycle management with auto follow-up
- **Document Collection**: Application and bank statement tracking

### Special Features
- **PAGE SIGN**: E-signature system
- **PAGE ACH**: ACH payment processing
- **PAGE BANK**: Bank account linking
- **APPLICATIONS**: Application management and tracking
- **Fiyah Scraper**: Data scraping tool
- **Grant Matching**: Automated grant discovery

### Communication Channels
- SMS (via personal phones - FREE)
- Email (Mailgun)
- Voice (VoIP.ms)
- WhatsApp (personal account)
- Telegram (personal account)
- Signal (personal account)
- Facebook Messenger
- Instagram DM
- Snapchat

## 📋 Requirements

- Node.js 18+ or Bun
- VoIP.ms account (for calling)
- Mailgun account (for email)
- Stripe account (for payments)
- Personal phone(s) for free SMS

## 🛠️ Installation

1. **Download the project**
   \`\`\`bash
   # Extract the ZIP file
   cd page-crm
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   bun install
   \`\`\`

3. **Configure environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

   Add your credentials:
   \`\`\`
   NEXT_PUBLIC_VOIP_SERVER=your-voip-server
   NEXT_PUBLIC_VOIP_USERNAME=your-username
   MAILGUN_API_KEY=your-mailgun-key
   MAILGUN_DOMAIN=your-domain
   \`\`\`

4. **Run development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   \`\`\`

5. **Open browser**
   \`\`\`
   http://localhost:3000
   \`\`\`

## 🔐 Default Login

**Master Admin**
- Email: sean.federaldirectfunding.@gmail.com
- Password: Rasta4iva!
- Phone (for reset): 2016404635

## 📱 Phone Sync Setup

To use FREE SMS via your personal phones:

1. Go to Settings > Phone Manager
2. Click "Add Phone"
3. Enter phone details
4. Install PAGE CRM Phone App on your Android device
5. Connect and start sending free SMS!

## 🌐 Social Platform Setup

Connect your existing personal accounts:

1. Go to Settings > Social Platforms
2. Select platform (WhatsApp, Telegram, Signal, etc.)
3. Follow authentication steps
4. Start messaging through your personal accounts!

## 💳 Pricing

- **Up to 9 users**: $299.99/month
- **Up to 50 users**: $249.99/month
- **Up to 100 users**: $199.00/month
- **100+ users**: Call 201-640-4635

## 🚀 Deployment

### Method 1: Vercel CLI (FASTEST - 2 minutes)

1. **Navigate to project folder**
   \`\`\`bash
   cd page-crm
   \`\`\`

2. **Login to Vercel**
   \`\`\`bash
   vercel login
   \`\`\`

3. **Deploy to production**
   \`\`\`bash
   vercel --prod
   \`\`\`

### Method 2: GitHub + Vercel (RECOMMENDED)

1. **Push to GitHub**
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR-USERNAME/pcs-pcrm.git
   git push -u origin main
   \`\`\`

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Add environment variables
   - Click "Deploy"

3. **Add Environment Variables in Vercel**
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.example`
   - Redeploy

### Method 3: v0 Publish Button

1. Click "Publish" button in v0 (top right)
2. Connect Vercel account
3. Add environment variables
4. Deploy

### Method 4: Direct ZIP Upload

1. Download ZIP from v0
2. Go to https://vercel.com/new
3. Drag and drop ZIP file
4. Configure and deploy

## 📞 Support

- Phone: 201-640-4635
- Email: sean.federaldirectfunding.@gmail.com

## 📄 License

Proprietary - All rights reserved

---

Built with Next.js 16, React 19, Tailwind CSS v4, and shadcn/ui

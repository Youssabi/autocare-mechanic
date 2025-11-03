# ⚡ DEPLOY IN 5 MINUTES

## Quick Start (Choose One)

### 🟢 EASIEST: GitHub + Cloudflare Auto-Deploy

1. **Go to:** https://github.com/new
   - Name: `autocare-mechanic`
   - Click "Create repository"

2. **Upload files** (via GitHub web UI):
   - Click "Add file" → "Upload files"
   - Select all folders: admin/, css/, js/
   - Upload index.html, CLOUDFLARE_DEPLOYMENT_GUIDE.md
   - Commit!

3. **Go to:** https://dash.cloudflare.com/
   - Workers & Pages → Create Application
   - "Connect to Git" 
   - Select your repo
   - Use defaults, click "Save and Deploy"

4. **Wait 2 minutes** ✅ LIVE!

Your URL will be: `autocare-mechanic.pages.dev`

---

### 🟡 QUICK: Direct Wrangler Deploy

```bash
# Install Wrangler (one-time)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy (run from autocare-deploy folder)
wrangler pages deploy .
```

Done! Check the URL shown.

---

### 🔵 CUSTOM DOMAIN

After deploying with GitHub or Wrangler:

1. Go to Cloudflare Pages project → Settings
2. Custom Domains → Add domain
3. Point DNS to Cloudflare
4. Done! SSL automatic

---

## THAT'S IT! 🎉

Your site is now live on Cloudflare Pages!

**Next:**
- Test everything at your URL
- Update business info in config.js
- Deploy again (if GitHub, auto-deploys!)

For detailed guide: See CLOUDFLARE_DEPLOYMENT_GUIDE.md

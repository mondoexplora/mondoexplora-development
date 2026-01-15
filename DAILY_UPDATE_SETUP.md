# Daily Data Update - Setup Guide

## ✅ What's Been Created

1. **GitHub Actions Workflow**: `.github/workflows/daily-data-update.yml`
   - Runs daily at **9am Spain time** (8am UTC)
   - Updates CSV → JSON files
   - Commits and pushes changes
   - Sends email notifications

2. **Enhanced Script**: `scripts/data-processor.js`
   - Updated CSV URL to the current Channable feed
   - Collects statistics for email reports
   - Creates `data-update-stats.json` with all metrics

## 🔧 Setup Steps

### Step 1: Configure Email Settings (Required)

You need to set up GitHub Secrets for email notifications. Choose one option:

#### Option A: Gmail SMTP (Easiest)

1. Go to your GitHub repository: `mondoexplora-development`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these:

| Secret Name | Value | Example |
|------------|-------|---------|
| `SMTP_SERVER` | `smtp.gmail.com` | smtp.gmail.com |
| `SMTP_PORT` | `587` | 587 |
| `SMTP_USERNAME` | Your Gmail address | yourname@gmail.com |
| `SMTP_PASSWORD` | Gmail App Password (see below) | xxxx xxxx xxxx xxxx |
| `EMAIL_FROM` | Your email | yourname@gmail.com |
| `EMAIL_TO` | Where to send reports | yourname@gmail.com |

**How to get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Create new app password for "Mail"
5. Copy the 16-character password (use this as `SMTP_PASSWORD`)

#### Option B: Other Email Providers

Use the same secret names, but change the values:

**Outlook/Hotmail:**
- `SMTP_SERVER`: `smtp-mail.outlook.com`
- `SMTP_PORT`: `587`

**Yahoo:**
- `SMTP_SERVER`: `smtp.mail.yahoo.com`
- `SMTP_PORT`: `587`

**Custom SMTP:**
- Use your email provider's SMTP settings

### Step 2: Test the Workflow

1. Go to your GitHub repository
2. Click **Actions** tab
3. Click **Daily Data Update** workflow
4. Click **Run workflow** → **Run workflow** (manual trigger)
5. Watch it run and check:
   - ✅ Script executes successfully
   - ✅ Changes are committed and pushed
   - ✅ Email is received

### Step 3: Verify First Scheduled Run

The workflow will run automatically tomorrow at 9am Spain time.

**Note:** GitHub Actions schedules use UTC time. Spain time changes:
- **Winter (CET)**: 8am UTC = 9am Spain time ✅
- **Summer (CEST)**: 8am UTC = 10am Spain time ⚠️

**To get exact 9am year-round:** Change the cron to `0 7 * * *` in the workflow file (7am UTC = 9am CEST / 8am CET)

## 📧 Email Reports

### Success Email Includes:
- ✅ Total hotels processed
- ✅ Total destinations created
- ✅ Number of JSON files created
- ✅ Breakdown by file type
- ✅ Git commit status
- ✅ Link to statistics file

### Error Email Includes:
- ❌ Error message
- ❌ Link to GitHub Actions logs
- ❌ Steps to troubleshoot

## 🔄 What Happens Daily

1. **9am Spain Time**: Workflow triggers automatically
2. **Downloads CSV**: Fetches latest from Channable
3. **Processes Data**: Converts to JSON files
4. **Generates Stats**: Creates `data-update-stats.json`
5. **Commits Changes**: Pushes updated JSON files to GitHub
6. **Netlify Rebuilds**: Automatically detects changes and rebuilds site
7. **Sends Email**: You receive success/error notification

## 🛠️ Troubleshooting

### Email Not Sending?
- Check GitHub Secrets are set correctly
- Check spam folder
- Verify SMTP credentials
- Check GitHub Actions logs for email errors

### Script Failing?
- Check CSV URL is accessible
- Verify Node.js dependencies are installed
- Check GitHub Actions logs for detailed errors

### Changes Not Committing?
- Check GitHub Token permissions
- Verify repository access
- Check if `data/` folder has actual changes

## 📝 Manual Testing

Test the script locally:
```bash
node scripts/data-processor.js
```

Check the stats file:
```bash
cat data-update-stats.json
```

## ⚙️ Customization

### Change Schedule Time
Edit `.github/workflows/daily-data-update.yml`:
```yaml
- cron: '0 8 * * *'  # Change 8 to desired UTC hour
```

### Change Email Format
Edit the "Prepare email content" step in the workflow file.

### Add More Recipients
Add multiple emails separated by commas in `EMAIL_TO` secret (if your SMTP supports it).

---

**Status:** ✅ Ready to use (after email secrets are configured)
**Next Step:** Set up GitHub Secrets (Step 1 above)
